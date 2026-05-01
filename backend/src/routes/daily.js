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

const getUserLevel = async (userId) => {
  const profile = await pool.query('SELECT experience FROM user_profiles WHERE user_id = $1', [userId])
  const exp = profile.rows[0]?.experience || 'beginner'
  if (exp === 'beginner' || exp === 'basic') return 'easy'
  if (exp === 'intermediate') return 'medium'
  if (exp === 'advanced') return 'hard'
  return 'easy'
}

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Tilni kursga moslashtirish
const detectLanguage = (course) => {
  const text = ((course.title || '') + ' ' + (course.category || '') + ' ' + (course.about || '')).toLowerCase()
  if (text.includes('javascript') || text.includes('react') || text.includes('node') || text.includes('vue')) return 'javascript'
  if (text.includes('python') || text.includes('django') || text.includes('flask')) return 'python'
  if (text.includes('c++') || text.includes('cpp')) return 'cpp'
  if (text.includes('java') && !text.includes('javascript')) return 'java'
  if (text.includes('php')) return 'php'
  return 'python'
}

// Faqat dasturlash kursi ekanligini tekshirish
const isProgrammingCourse = (course) => {
  const text = ((course.title || '') + ' ' + (course.category || '')).toLowerCase()
  const programmingKeywords = ['dasturlash', 'programming', 'javascript', 'python', 'react', 'node', 'java', 'c++', 'cpp', 'php', 'web', 'kod', 'code']
  return programmingKeywords.some(kw => text.includes(kw))
}

const generateProblem = async (difficulty, language, courseInfo = '') => {
  const difficultyMap = {
    easy: 'oson (yangi boshlovchilar uchun)',
    medium: 'o\'rta darajada',
    hard: 'qiyin (ilg\'or daraja)'
  }

  const courseContext = courseInfo
    ? `\nFoydalanuvchi quyidagi kursda o'qiyapti:\n${courseInfo}\n\nMasala SHU MAVZUGA bog'liq bo'lsin (kurs mazmuni asosida).`
    : ''

  const prompt = `Sen dasturlash masalalari yaratuvchi AI san. Bugun uchun YANGI va QIZIQARLI dasturlash masalasini yarat.

DARAJA: ${difficultyMap[difficulty] || 'oson'}
DASTURLASH TILI: ${language}
${courseContext}

QOIDALAR:
1. Masala ${language} tilida yechilsin
2. Funksiya yozish kerak bo'ladi
3. 2-3 ta misol bersin
4. Aniq va tushunarli o'zbek tilida bo'lsin

JAVOB FAQAT JSON formatda:
{
  "title": "Masala nomi (qisqa, 3-5 so'z)",
  "text": "Masala matni (tushuntirish + 2-3 misol)\\nMisol:\\nfuncName(arg) → result",
  "template": "Funksiya shabloni"
}`

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
        temperature: 0.8,
        max_tokens: 800
      })
    })

    const data = await groqRes.json()
    const text = data.choices?.[0]?.message?.content || ''
    const match = text.match(/\{[\s\S]*\}/)

    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        title: parsed.title || 'Kunlik masala',
        text: parsed.text || 'Masala matni',
        template: parsed.template || ''
      }
    }
  } catch (err) {
    console.error('AI generate error:', err)
  }

  const fallbacks = {
    python: { title: 'Sonni teskari aylantirish', text: 'reverse(123) → 321', template: 'def reverse(n):\n    pass' },
    javascript: { title: 'Massiv yig\'indisi', text: 'sumArray([1,2,3]) → 6', template: 'function sumArray(arr) {\n}' },
    cpp: { title: 'Sonlar yig\'indisi', text: 'sum(3, 5) → 8', template: 'int sum(int a, int b) {\n    return 0;\n}' },
    java: { title: 'Sonlar yig\'indisi', text: 'sum(3, 5) → 8', template: 'public static int sum(int a, int b) {\n    return 0;\n}' },
    php: { title: 'Massiv yig\'indisi', text: 'sumArray([1,2,3]) → 6', template: '<?php\nfunction sumArray($arr) {\n}\n?>' }
  }
  return fallbacks[language] || fallbacks.python
}

const ensureStreak = async (userId) => {
  const r = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [userId])
  if (r.rows.length === 0) {
    await pool.query('INSERT INTO user_streaks (user_id) VALUES ($1)', [userId])
    return { current_streak: 0, longest_streak: 0, total_points: 0, total_completed: 0 }
  }
  return r.rows[0]
}

// =================== ROUTES ===================

// Foydalanuvchining dasturlash kurslari ro'yxati
router.get('/my-courses', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.title, c.category, c.daraja, c.about, c.image
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.created_at DESC
    `, [req.user.id])

    // Faqat dasturlash kurslari
    const programmingCourses = result.rows
      .filter(c => isProgrammingCourse(c))
      .map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        daraja: c.daraja,
        image: c.image,
        language: detectLanguage(c)
      }))

    res.json(programmingCourses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// Bugungi masalani olish (course_id ixtiyoriy parametr)
router.get('/today', auth, async (req, res) => {
  try {
    const today = getTodayDate()
    const requestedCourseId = req.query.courseId // ?courseId=php-asoslari

    await ensureStreak(req.user.id)

    let challengeRes = await pool.query(
      'SELECT * FROM daily_challenges WHERE user_id = $1 AND challenge_date = $2',
      [req.user.id, today]
    )

    let challenge

    if (challengeRes.rows.length === 0) {
      // Yangi masala yaratamiz
      let selectedCourse = null

      if (requestedCourseId) {
        // Foydalanuvchi tanlagan kurs
        const cr = await pool.query(`
          SELECT c.title, c.category, c.daraja, c.about
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.user_id = $1 AND c.id = $2
        `, [req.user.id, requestedCourseId])

        if (cr.rows.length > 0 && isProgrammingCourse(cr.rows[0])) {
          selectedCourse = cr.rows[0]
        }
      }

      if (!selectedCourse) {
        // So'nggi yozilgan dasturlash kursi
        const cr = await pool.query(`
          SELECT c.title, c.category, c.daraja, c.about
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.user_id = $1
          ORDER BY e.created_at DESC
        `, [req.user.id])

        const programming = cr.rows.filter(c => isProgrammingCourse(c))
        if (programming.length > 0) {
          selectedCourse = programming[0]
        }
      }

      let courseInfo = ''
      let detectedLang = 'python'

      if (selectedCourse) {
        courseInfo = `"${selectedCourse.title}" (${selectedCourse.category}, ${selectedCourse.daraja}) - ${(selectedCourse.about || '').substring(0, 100)}`
        detectedLang = detectLanguage(selectedCourse)
      }

      const difficulty = await getUserLevel(req.user.id)
      const problem = await generateProblem(difficulty, detectedLang, courseInfo)

      const insertRes = await pool.query(`
        INSERT INTO daily_challenges (user_id, challenge_date, difficulty, language, problem_title, problem_text, template, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING *
      `, [req.user.id, today, difficulty, detectedLang, problem.title, problem.text, problem.template])

      challenge = insertRes.rows[0]
    } else {
      challenge = challengeRes.rows[0]
    }

    const streakRes = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [req.user.id])
    const streak = streakRes.rows[0]

    res.json({
      challenge: {
        id: challenge.id,
        title: challenge.problem_title,
        text: challenge.problem_text,
        template: challenge.template,
        language: challenge.language,
        difficulty: challenge.difficulty,
        status: challenge.status,
        score: challenge.score,
        userCode: challenge.user_code,
        feedback: challenge.feedback
      },
      streak: {
        current: streak.current_streak,
        longest: streak.longest_streak,
        totalCompleted: streak.total_completed,
        totalPoints: streak.total_points
      }
    })
  } catch (err) {
    console.error('Daily today error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Yangi masala olish (kursni o'zgartirish — bugungisini o'chirib qaytadan)
router.post('/regenerate', auth, async (req, res) => {
  try {
    const { courseId } = req.body
    const today = getTodayDate()

    // Bugungi masala mavjudligini tekshirish
    const existing = await pool.query(
      'SELECT * FROM daily_challenges WHERE user_id = $1 AND challenge_date = $2',
      [req.user.id, today]
    )

    // Faqat hali yechmagan bo'lsa o'zgartirishga ruxsat
    if (existing.rows.length > 0 && existing.rows[0].status === 'completed') {
      return res.status(400).json({ message: 'Bugungi masala allaqachon yechilgan' })
    }

    // Eski masalani o'chirish
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM daily_challenges WHERE id = $1', [existing.rows[0].id])
    }

    // Tanlangan kurs ma'lumotlari
    const cr = await pool.query(`
      SELECT c.title, c.category, c.daraja, c.about
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1 AND c.id = $2
    `, [req.user.id, courseId])

    if (cr.rows.length === 0) {
      return res.status(404).json({ message: 'Kurs topilmadi' })
    }

    const course = cr.rows[0]
    if (!isProgrammingCourse(course)) {
      return res.status(400).json({ message: 'Bu dasturlash kursi emas' })
    }

    const courseInfo = `"${course.title}" (${course.category}, ${course.daraja}) - ${(course.about || '').substring(0, 100)}`
    const detectedLang = detectLanguage(course)
    const difficulty = await getUserLevel(req.user.id)
    const problem = await generateProblem(difficulty, detectedLang, courseInfo)

    const insertRes = await pool.query(`
      INSERT INTO daily_challenges (user_id, challenge_date, difficulty, language, problem_title, problem_text, template, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `, [req.user.id, today, difficulty, detectedLang, problem.title, problem.text, problem.template])

    const challenge = insertRes.rows[0]

    res.json({
      challenge: {
        id: challenge.id,
        title: challenge.problem_title,
        text: challenge.problem_text,
        template: challenge.template,
        language: challenge.language,
        difficulty: challenge.difficulty,
        status: challenge.status,
        userCode: challenge.user_code
      }
    })
  } catch (err) {
    console.error('Regenerate error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Yechim yuborish (eski code)
router.post('/submit/:id', auth, async (req, res) => {
  try {
    const { code } = req.body
    const today = getTodayDate()

    const challengeRes = await pool.query(
      'SELECT * FROM daily_challenges WHERE id = $1 AND user_id = $2 AND challenge_date = $3',
      [req.params.id, req.user.id, today]
    )

    if (challengeRes.rows.length === 0) return res.status(404).json({ message: 'Topilmadi' })

    const challenge = challengeRes.rows[0]
    if (challenge.status === 'completed') return res.status(400).json({ message: 'Allaqachon yechgansiz' })
    if (!code?.trim()) return res.status(400).json({ message: 'Kod bo\'sh' })
    if (code.trim().length < 10) return res.status(400).json({ message: 'Kod juda qisqa' })

    const aiPrompt = `Kod baholovchi AI. QATTIQ baholang.
MASALA: ${challenge.problem_title}
${challenge.problem_text}

KOD:
\`\`\`${challenge.language}
${code}
\`\`\`

Tekshirish: Kod masala yechadimi? Placeholder bormi?
JAVOB JSON: {"score": 0-100, "feedback": "qisqa o'zbek tahlil"}`

    let score = 0
    let feedback = 'Tahlil bekor qilindi'

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: aiPrompt }],
          temperature: 0.2,
          max_tokens: 300
        })
      })

      const data = await groqRes.json()
      const text = data.choices?.[0]?.message?.content || ''
      const match = text.match(/\{[\s\S]*?\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        score = Math.min(100, Math.max(0, parseInt(parsed.score) || 0))
        feedback = parsed.feedback || 'Tahlil qilindi'
      }
    } catch (err) {
      console.error(err)
    }

    const passed = score >= 60

    await pool.query(`
      UPDATE daily_challenges 
      SET user_code = $1, score = $2, feedback = $3, status = $4, completed_at = NOW()
      WHERE id = $5
    `, [code, score, feedback, passed ? 'completed' : 'failed', challenge.id])

    if (passed) {
      const streakRes = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [req.user.id])
      const streak = streakRes.rows[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = 1
      if (streak.last_completed_date) {
        const lastDate = new Date(streak.last_completed_date).toISOString().split('T')[0]
        if (lastDate === yesterdayStr) newStreak = streak.current_streak + 1
        else if (lastDate === today) newStreak = streak.current_streak
      }

      const longestStreak = Math.max(newStreak, streak.longest_streak)
      const pointsEarned = 10 + (newStreak * 2)

      await pool.query(`
        UPDATE user_streaks 
        SET current_streak = $1, longest_streak = $2, last_completed_date = $3,
            total_completed = total_completed + 1, total_points = total_points + $4,
            updated_at = NOW()
        WHERE user_id = $5
      `, [newStreak, longestStreak, today, pointsEarned, req.user.id])

      res.json({ passed: true, score, feedback, pointsEarned, newStreak, longestStreak })
    } else {
      res.json({ passed: false, score, feedback, pointsEarned: 0 })
    }
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/stats', auth, async (req, res) => {
  try {
    await ensureStreak(req.user.id)
    const result = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [req.user.id])
    const stats = result.rows[0]
    res.json({
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      totalCompleted: stats.total_completed,
      totalPoints: stats.total_points
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router