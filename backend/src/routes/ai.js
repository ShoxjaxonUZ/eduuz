const express = require('express')
const router = express.Router()

router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, count = 5 } = req.body
    const safeCount = Math.min(parseInt(count) || 5, 20)

    if (!topic) {
      return res.status(400).json({ message: 'Mavzu kiritilmagan' })
    }

    const prompt = `Sen ta'lim platformasi uchun test savollari yaratuvchi assistentsan to'g'ri javobni A variyantga qo'yma.

Mavzu: "${topic}"
Savollar soni: ${safeCount}

Quyidagi JSON formatda ${safeCount} ta test savoli yarat. Faqat sof JSON qaytargin, boshqa hech narsa yozma:
{"questions":[{"question":"Savol matni","options":["A variant","B variant","C variant","D variant"],"correct":0}]}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq xatosi:', data)
      return res.status(500).json({ message: 'AI xizmatida xatolik: ' + (data.error?.message || 'Noma\'lum') })
    }

    let text = data.choices[0].message.content
    text = text.replace(/```json|```/g, '').trim()

    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1)
    }

    const parsed = JSON.parse(text)
    console.log('Groq ishladi! ✅', safeCount, 'ta savol yaratildi')
    res.json(parsed)

  } catch (err) {
    console.error('AI route xatosi:', err)
    res.status(500).json({ message: 'Xatolik: ' + err.message })
  }
})

// AI TEACHER — savolga javob
router.post('/teacher', async (req, res) => {
  // Token tekshiruv
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })

  let userId
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    userId = decoded.id
  } catch {
    return res.status(401).json({ message: 'Token noto\'g\'ri' })
  }

  try {
    const { message, history } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Savol kiriting' })
    }

    const pool = require('../db')
    const today = new Date().toISOString().split('T')[0]
    const DAILY_LIMIT = 20

    // Limit tekshirish
    let usageRes = await pool.query(
      'SELECT * FROM ai_teacher_usage WHERE user_id = $1 AND usage_date = $2',
      [userId, today]
    )

    let currentCount = 0
    if (usageRes.rows.length > 0) {
      currentCount = usageRes.rows[0].count
    }

    if (currentCount >= DAILY_LIMIT) {
      return res.status(429).json({
        message: `Kunlik limit tugadi (${DAILY_LIMIT}/${DAILY_LIMIT}). Ertaga qayta urinib ko'ring!`,
        limitReached: true,
        used: currentCount,
        limit: DAILY_LIMIT
      })
    }

    // BIRINCHI BOSQICH — Mavzuni aniqlash
    const detectPrompt = `Quyidagi savol qaysi sohaga tegishli? FAQAT BITTA so'z bilan javob bering:
- "dasturlash" (kod, programming, web, JS, Python va h.k.)
- "matematika" (algebra, geometriya, hisoblash, formulalar)
- "fizika" (kinematika, elektr, optika, mexanika)
- "ingliz" (english, grammar, words, til o'rganish)
- "umumiy" (boshqa mavzular)

Savol: "${message}"

Faqat soha nomini yozing, tushuntirmay.`

    let subject = 'umumiy'
    try {
      const detectRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: detectPrompt }],
          temperature: 0.1,
          max_tokens: 20
        })
      })
      const detectData = await detectRes.json()
      const detected = (detectData.choices?.[0]?.message?.content || '').toLowerCase().trim()

      if (detected.includes('dasturlash') || detected.includes('programming')) subject = 'dasturlash'
      else if (detected.includes('matematika') || detected.includes('math')) subject = 'matematika'
      else if (detected.includes('fizika') || detected.includes('physics')) subject = 'fizika'
      else if (detected.includes('ingliz') || detected.includes('english')) subject = 'ingliz'
    } catch (err) {
      console.error('Detect error:', err)
    }

    // IKKINCHI BOSQICH — Mavzuga mos system prompt
    const systemPrompts = {
      dasturlash: `Sen tajribali DASTURLASH USTOZ ISAN. 10+ yil tajribang bor. Vazifang:
- Foydalanuvchiga kod yozish, algoritmlar, data structures, web dev, mobil dev haqida o'rgatish
- Kod misollar markdown \`\`\` ichida yozish (sintaksis bo'yash uchun)
- Eng yaxshi praktikalar (best practices) ni tushuntirish
- Xatolarni qanday tuzatishni ko'rsatish
- O'zbek tilida (lotin yozuvi), oddiy va aniq tushuntirish
- Praktik misollar bilan yondashuv`,

      matematika: `Sen tajribali MATEMATIKA O'QITUVCHISISAN. Maktab va universitet darajasida o'rgatasan. Vazifang:
- Matematika masalalarini bosqichma-bosqich yechib ko'rsatish
- Formulalarni aniq yozish va tushuntirish
- Algebra, geometriya, trigonometriya, hisoblash, statistikani tushuntirish
- Misollar bilan ishlash (qadam-baqadam)
- O'zbek tilida (lotin yozuvi)
- Murakkab tushunchalarni oddiy qilib aytish

MUHIM QOIDA:
- HECH QACHON dasturlash \`\`\`code\`\`\` bloklari ishlatma (Python, JS va h.k.)
- Faqat matematika formulalari va tushuntirishlar bo'lsin
- Formulalar uchun oddiy belgilar ishlat: x², √(a+b), π, ∫, Σ, ≤, ≥
- Yechishni qadamlar (1-qadam, 2-qadam) bilan ko'rsat`,

      matematika: `Sen tajribali MATEMATIKA O'QITUVCHISISAN. Maktab va universitet darajasida o'rgatasan. Vazifang:
- Matematika masalalarini bosqichma-bosqich yechib ko'rsatish
- Formulalarni aniq yozish va tushuntirish
- Algebra, geometriya, trigonometriya, hisoblash, statistikani tushuntirish
- Misollar bilan ishlash (qadam-baqadam)
- O'zbek tilida (lotin yozuvi)
- Murakkab tushunchalarni oddiy qilib aytish

MUHIM QOIDA:
- HECH QACHON dasturlash \`\`\`code\`\`\` bloklari ishlatma (Python, JS va h.k.)
- Faqat matematika formulalari va tushuntirishlar bo'lsin
- Formulalar uchun oddiy belgilar ishlat: x², √(a+b), π, ∫, Σ, ≤, ≥
- Yechishni qadamlar (1-qadam, 2-qadam) bilan ko'rsat`,

      ingliz: `Sen tajribali INGLIZ TILI O'QITUVCHISISAN. Vazifang:
- Grammatika qoidalarini tushuntirish (Present, Past, Future, Modals, Conditionals va h.k.)
- So'z boyligini oshirish — yangi so'zlar va iboralar
- Talaffuz va yozuvni tushuntirish
- Tarjima qilishda yordam berish
- Misollar bilan o'rgatish (sentence examples)
- IELTS, TOEFL ga tayyorlanishga yordam
- Javoblarni O'ZBEK TILIDA (lotin yozuvi) berish
- Ingliz so'z/jumlalarni "qo'shtirnoq" ichida yoki misol sifatida yozish

MUHIM QOIDA:
- HECH QACHON \`\`\`code\`\`\` yoki \`\`\`block\`\`\` ishlatma!
- Dasturlash kod misollari ham YOZMA (chunki bu ingliz tili darsi)
- Faqat oddiy matn, jumla misollari va ro'yxatlar ishlat
- Ingliz jumla misollarini quyidagicha yoz:
  Misol: I have been working here for 5 years.
  Tarjima: Men bu yerda 5 yildan beri ishlayapman.`,

      umumiy: `Sen do'stona AI USTOZ SAN. Foydalanuvchi savoliga aniq, oddiy va do'stona javob ber. O'zbek tilida (lotin yozuvi). Markdown \`\`\` kod uchun ishlatishing mumkin.`
    }

    const systemPrompt = systemPrompts[subject] + `

UMUMIY QOIDALAR:
- Javob 200-500 so'z oralig'ida
- Markdown \`\`\` ichida kod yozish (agar kerak bo'lsa)
- Aniq, tushunarli, do'stona uslub
- Agar savol ushbu sohaga tegishli bo'lmasa, foydalanuvchini to'g'ri yo'naltiring`

    const messages = [{ role: 'system', content: systemPrompt }]

    if (Array.isArray(history) && history.length > 0) {
      history.slice(-10).forEach(h => {
        messages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        })
      })
    }
    messages.push({ role: 'user', content: message })

    // UCHINCHI BOSQICH — Javob olish
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    const data = await groqRes.json()
    if (!groqRes.ok || !data.choices?.[0]?.message?.content) {
      console.error('Groq API error:', data)
      return res.status(500).json({ message: 'AI javob bermadi' })
    }

    // Limit yangilash
    if (usageRes.rows.length === 0) {
      await pool.query(
        'INSERT INTO ai_teacher_usage (user_id, usage_date, count) VALUES ($1, $2, 1)',
        [userId, today]
      )
    } else {
      await pool.query(
        'UPDATE ai_teacher_usage SET count = count + 1, updated_at = NOW() WHERE user_id = $1 AND usage_date = $2',
        [userId, today]
      )
    }

    res.json({
      answer: data.choices[0].message.content,
      subject,
      used: currentCount + 1,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - (currentCount + 1)
    })
  } catch (err) {
    console.error('AI Teacher error:', err)
    res.status(500).json({ message: 'Server xatosi: ' + err.message })
  }
})

// Limit holatini tekshirish
router.get('/teacher/usage', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })

  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const pool = require('../db')
    const today = new Date().toISOString().split('T')[0]

    const result = await pool.query(
      'SELECT count FROM ai_teacher_usage WHERE user_id = $1 AND usage_date = $2',
      [decoded.id, today]
    )

    const used = result.rows[0]?.count || 0
    const limit = 20

    res.json({ used, limit, remaining: limit - used })
  } catch (err) {
    res.status(401).json({ message: 'Token xatosi' })
  }
})

module.exports = router