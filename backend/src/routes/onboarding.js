const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const pool = require('../db')

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token noto\'g\'ri' })
  }
}

// Status — onboarding o'tilganmi?
router.get('/status', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT onboarded FROM users WHERE id = $1', [req.user.id])
    const profile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id])
    res.json({
      onboarded: result.rows[0]?.onboarded || false,
      profile: profile.rows[0] || null
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Test natijalarini saqlash va AI tavsiyasi olish
router.post('/complete', auth, async (req, res) => {
  try {
    const { ageGroup, goal, experience, interests, availableTime, preferredField, chatHistory } = req.body

    // Barcha kurslarni olish
    const coursesRes = await pool.query('SELECT id, title, category, daraja, description FROM courses')
    const allCourses = coursesRes.rows

    // AI dan tavsiya so'rash
    const prompt = `Sen EduUz ta'lim platformasining konsultantsisan. Foydalanuvchining ma'lumotlariga qarab eng mos KURSLARNI tavsiya qil.

FOYDALANUVCHI MA'LUMOTLARI:
- Yosh guruhi: ${ageGroup}
- Maqsad: ${goal}
- Tajriba: ${experience}
- Qiziqishlari: ${(interests || []).join(', ')}
- Mavjud vaqt (kunlik): ${availableTime}
- Afzal soha: ${preferredField}

${chatHistory ? `\nQO'SHIMCHA SUHBAT:\n${chatHistory}` : ''}

MAVJUD KURSLAR:
${allCourses.map(c => `- ID: ${c.id} | "${c.title}" | Kategoriya: ${c.category} | Daraja: ${c.daraja}`).join('\n')}

VAZIFA:
1. Foydalanuvchiga eng mos 3-5 ta kursni tanlang
2. Nimaga shu kurslarni tanlaganingizni tushuntiring
3. Maslahat bering — qaysi kursdan boshlash kerak

JAVOB FAQAT JSON formatda:
{
  "courseIds": ["id1", "id2", "id3"],
  "advice": "2-3 jumlali tavsiya o'zbek tilida (do'stona uslubda)",
  "studyPlan": "Qisqa o'qish rejasi — 3-4 jumla"
}`

    let recommendedCourses = []
    let aiAdvice = ''
    let studyPlan = ''

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1000
        })
      })

      const aiData = await groqRes.json()
      const text = aiData.choices?.[0]?.message?.content || ''
      const match = text.match(/\{[\s\S]*?\}/)

      if (match) {
        const parsed = JSON.parse(match[0])
        recommendedCourses = (parsed.courseIds || [])
          .map(id => allCourses.find(c => String(c.id) === String(id)))
          .filter(Boolean)
        aiAdvice = parsed.advice || ''
        studyPlan = parsed.studyPlan || ''
      }
    } catch (aiErr) {
      console.error('AI error:', aiErr)
      // Fallback — kategoriya bo'yicha tavsiya
      recommendedCourses = allCourses
        .filter(c => c.category?.toLowerCase().includes(preferredField?.toLowerCase()))
        .slice(0, 5)
      aiAdvice = 'Sizning qiziqishlaringizga mos kurslar tanlandi.'
      studyPlan = 'Birinchi kursdan boshlang, har kuni 1-2 ta darsdan o\'qing.'
    }

    // Eng kamida 3 ta kurs bo'lsin
    if (recommendedCourses.length < 3) {
      const remaining = allCourses
        .filter(c => !recommendedCourses.find(r => r.id === c.id))
        .slice(0, 3 - recommendedCourses.length)
      recommendedCourses = [...recommendedCourses, ...remaining]
    }

    const courseIds = recommendedCourses.map(c => String(c.id))

    // Profil saqlash
    const existing = await pool.query('SELECT id FROM user_profiles WHERE user_id = $1', [req.user.id])

    if (existing.rows.length > 0) {
      await pool.query(`
        UPDATE user_profiles 
        SET age_group = $1, goal = $2, experience = $3, interests = $4,
            available_time = $5, preferred_field = $6, recommended_courses = $7,
            ai_advice = $8, completed_at = NOW()
        WHERE user_id = $9
      `, [ageGroup, goal, experience, interests, availableTime, preferredField, courseIds, aiAdvice, req.user.id])
    } else {
      await pool.query(`
        INSERT INTO user_profiles (user_id, age_group, goal, experience, interests, available_time, preferred_field, recommended_courses, ai_advice, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [req.user.id, ageGroup, goal, experience, interests, availableTime, preferredField, courseIds, aiAdvice])
    }

    await pool.query('UPDATE users SET onboarded = TRUE WHERE id = $1', [req.user.id])

    res.json({
      success: true,
      recommendedCourses,
      advice: aiAdvice,
      studyPlan
    })
  } catch (err) {
    console.error('Onboarding complete error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Konsultatsiya chat — AI bilan suhbat
router.post('/chat', auth, async (req, res) => {
  try {
    const { messages, profileData } = req.body

    const turns = messages.filter(m => m.role === 'user').length

    const systemPrompt = `Sen EduUz ta'lim platformasining do'stona AI konsultantsisan. O'ZBEK TILIDA suhbatlash.

FOYDALANUVCHI HAQIDA OLDINDAN MA'LUMOT:
- Yosh: ${profileData?.ageGroup || 'noma\'lum'}
- Maqsad: ${profileData?.goal || 'noma\'lum'}
- Tajriba: ${profileData?.experience || 'noma\'lum'}
- Qiziqishlari: ${(profileData?.interests || []).join(', ') || 'noma\'lum'}

SUHBAT QOIDALARI:
1. Foydalanuvchining oldin bergan javoblariga BOG'LIQ tarzda gaplash
2. Har xabarda BITTA aniq savol ber (ko'p emas)
3. Javoblarni QISQA va aniq qil (2-3 jumla)
4. Foydalanuvchi qiziqishlariga qarab MAVZULARGA chuqur kir
5. EduUz da kurslar bor: dasturlash, dizayn, biznes, matematika va h.k.
6. Bola yoki kichik yoshdagilarga oddiy va do'stona uslubda gaplash

HOZIRGI HOLAT: Suhbatda ${turns} ta javob bor.

${turns >= 3 ? `
MUHIM: Endi yetarli ma'lumot to'plandi. Foydalanuvchiga qisqacha xulosa ayting va EduUz platformasidagi mos kurslarni tavsiya qilishga tayyorligingizni bildiring. Misol: "Sizning qiziqishlaringizni yaxshi tushundim. EduUz platformasida sizga juda mos kurslar bor. Pastdagi 'Tavsiyalarni olish' tugmasini bosing — eng mos kurslarni ko'rsataman!"
` : `
HOZIR: Foydalanuvchini chuqurroq tushunish uchun yana 1-2 ta savol bering. Masalan: aniq qaysi yo'nalish, qaysi sohada ishlamoqchi, nimani yaratmoqchi, qanday loyihalar yoqadi.
`}

Foydalanuvchi xabariga mos javob bering — qisqa va do'stona.`

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 250
      })
    })

    const data = await groqRes.json()
    const answer = data.choices?.[0]?.message?.content || 'Kechirasiz, javob berolmadim.'

    res.json({ answer, readyForRecommendations: turns >= 3 })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router