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

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Module test holatini tekshirish
router.get('/status/:courseId/:moduleIndex', auth, async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params
    const today = getTodayDate()

    // Bugungi urinish bormi?
    const todayAttempt = await pool.query(`
      SELECT * FROM module_tests 
      WHERE user_id = $1 AND course_id = $2 AND module_index = $3 AND attempt_date = $4
    `, [req.user.id, courseId, moduleIndex, today])

    // Eng oxirgi muvaffaqiyatli urinish
    const passed = await pool.query(`
      SELECT * FROM module_tests 
      WHERE user_id = $1 AND course_id = $2 AND module_index = $3 AND passed = TRUE
      ORDER BY completed_at DESC LIMIT 1
    `, [req.user.id, courseId, moduleIndex])

    res.json({
      passed: passed.rows.length > 0,
      lastAttempt: todayAttempt.rows[0] || null,
      canAttempt: todayAttempt.rows.length === 0,
      score: passed.rows[0]?.score || null
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// Test savollarini yaratish
router.post('/generate', auth, async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.body
    const today = getTodayDate()

    // Bugun urinish qilganmi?
    const todayAttempt = await pool.query(`
      SELECT * FROM module_tests 
      WHERE user_id = $1 AND course_id = $2 AND module_index = $3 AND attempt_date = $4
    `, [req.user.id, courseId, moduleIndex, today])

    if (todayAttempt.rows.length > 0) {
      const att = todayAttempt.rows[0]
      if (att.passed) {
        return res.status(400).json({ message: 'Allaqachon o\'tdingiz', alreadyPassed: true })
      }
      return res.status(429).json({
        message: 'Bugun urinish qilingan. Ertaga qayta urinib ko\'ring',
        nextAttempt: 'tomorrow'
      })
    }

    // Kurs ma'lumotlarini olish
    const courseRes = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId])
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ message: 'Kurs topilmadi' })
    }
    const course = courseRes.rows[0]
    const lessons = typeof course.lessons === 'string' ? JSON.parse(course.lessons) : course.lessons

    // Modulga tegishli darslar (har 5 ta)
    const startLesson = moduleIndex * 5
    const endLesson = startLesson + 5
    const moduleLessons = lessons.slice(startLesson, endLesson)
    const lessonTitles = moduleLessons.map((l, i) => `${startLesson + i + 1}. ${l.title}`).join('\n')

    // AI dan 20 ta savol
    const prompt = `Sen test yaratuvchi AI san. ${course.title} kursi uchun 20 ta MUSHKUL test savolini yarat.

KURS HAQIDA: ${course.about || course.description || course.title}
KATEGORIYA: ${course.category}
DARAJA: ${course.daraja}

USHBU MODUL DARSLARI:
${lessonTitles}

QOIDALAR:
1. Aynan SHU darslar mavzularidan 20 ta savol yarat
2. Har savolda 4 ta variant (A, B, C, D)
3. Faqat BITTA to'g'ri javob
4. Savollar TO'G'RI JAVOBI har xil joyda bo'lsin (A, B, C, D barchasi tasodifiy)
5. Aniq va to'g'ri o'zbek tilida (lotin yozuvi)
6. Savollar mantiqiy va kursga oid bo'lsin

JAVOB FAQAT JSON formatda (boshqa hech narsa yozma):
{"questions": [
  {"question": "Savol matni", "options": ["A variant", "B variant", "C variant", "D variant"], "correct": 0},
  ...
]}

correct — to'g'ri javob indeksi (0 dan 3 gacha)`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    const data = await groqRes.json()
    const text = data.choices?.[0]?.message?.content || ''
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return res.status(500).json({ message: 'AI savollar yaratolmadi' })
    }

    const parsed = JSON.parse(match[0])
    const questions = (parsed.questions || []).slice(0, 20)

    if (questions.length < 20) {
      return res.status(500).json({ message: 'Savollar yetarli emas' })
    }

    res.json({ questions, total: 20 })
  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Testni yuborish
router.post('/submit', auth, async (req, res) => {
  try {
    const { courseId, moduleIndex, questions, answers } = req.body
    const today = getTodayDate()

    // To'g'ri javoblar sanog'i
    let correctCount = 0
    questions.forEach((q, i) => {
      if (parseInt(answers[i]) === parseInt(q.correct)) {
        correctCount++
      }
    })

    const passed = correctCount >= 16 // 80%

    await pool.query(`
      INSERT INTO module_tests (user_id, course_id, module_index, attempt_date, score, total, passed, questions, user_answers)
      VALUES ($1, $2, $3, $4, $5, 20, $6, $7::jsonb, $8::jsonb)
      ON CONFLICT (user_id, course_id, module_index, attempt_date) 
      DO UPDATE SET score = EXCLUDED.score, passed = EXCLUDED.passed, completed_at = NOW()
    `, [
      req.user.id, courseId, moduleIndex, today, correctCount, passed,
      JSON.stringify(questions), JSON.stringify(answers)
    ])

    res.json({
      passed,
      score: correctCount,
      total: 20,
      percentage: Math.round((correctCount / 20) * 100)
    })
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router