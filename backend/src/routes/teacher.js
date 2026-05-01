const express = require('express')
const router = express.Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

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

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eduuz.uz'
    if (decoded.email !== adminEmail) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token noto\'g\'ri' })
  }
}

// Ariza yuborish
router.post('/apply', auth, async (req, res) => {
  try {
    const { full_name, subject, experience } = req.body
    const user_id = req.user.id

    const existing = await pool.query(
      'SELECT * FROM teacher_requests WHERE user_id = $1 AND status = $2',
      [user_id, 'pending']
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Arizangiz ko\'rib chiqilmoqda' })
    }

    await pool.query(
      'INSERT INTO teacher_requests (user_id, full_name, subject, experience) VALUES ($1, $2, $3, $4)',
      [user_id, full_name, subject, experience]
    )

    res.json({ message: 'Ariza yuborildi!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik' })
  }
})

// O'z ariza holati
router.get('/my-status', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT status FROM teacher_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    )
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json({
      status: result.rows[0]?.status || 'none',
      role: userResult.rows[0]?.role || 'student'
    })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

// Admin — barcha arizalar
router.get('/requests', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tr.*, u.name, u.email
       FROM teacher_requests tr
       JOIN users u ON tr.user_id = u.id
       ORDER BY tr.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

// Admin — arizani tasdiqlash yoki rad etish
router.put('/requests/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const request = await pool.query(
      'SELECT * FROM teacher_requests WHERE id = $1',
      [req.params.id]
    )

    if (request.rows.length === 0) {
      return res.status(404).json({ message: 'Topilmadi' })
    }

    await pool.query(
      'UPDATE teacher_requests SET status = $1 WHERE id = $2',
      [status, req.params.id]
    )

    if (status === 'approved') {
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['teacher', request.rows[0].user_id]
      )
    } else if (status === 'rejected') {
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['student', request.rows[0].user_id]
      )
    }

    res.json({ message: status === 'approved' ? 'Tasdiqlandi!' : 'Rad etildi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

// O'qituvchi kurs qo'shishi
router.post('/courses', auth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows[0]?.role !== 'teacher') {
      return res.status(403).json({ message: 'Faqat o\'qituvchilar kurs qo\'sha oladi' })
    }

    const { title, category, daraja, emoji, desc, about, lessons } = req.body
    const id = Date.now().toString()

    await pool.query(
      `INSERT INTO courses (id, title, category, daraja, emoji, description, about, lessons, darslar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, category, daraja, emoji || '📚', desc || '', about || '',
       JSON.stringify(lessons || []), lessons?.length || 0]
    )

    res.json({ message: 'Kurs qo\'shildi!', id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik' })
  }
})

// O'qituvchining o'z kurslari
router.get('/my-courses', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

router.post('/save-course', auth, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id])
    const role = userResult.rows[0]?.role

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { id, title, category, daraja, emoji, desc, about, lessons, darslar } = req.body

    await pool.query(
      `INSERT INTO courses (id, title, category, daraja, emoji, description, about, lessons, darslar, teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         title = $2, category = $3, daraja = $4, emoji = $5,
         description = $6, about = $7, lessons = $8, darslar = $9`,
      [
        String(id),
        title,
        category || 'Boshqa',
        daraja || "Boshlang'ich",
        emoji || '📚',
        desc || '',
        about || '',
        JSON.stringify(lessons || []),
        darslar || lessons?.length || 0,
        req.user.id
      ]
    )

    res.json({ message: 'Kurs saqlandi!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik: ' + err.message })
  }
})

router.get('/all-courses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        COUNT(DISTINCT e.user_id) as students_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `)
    const courses = result.rows.map(c => ({
      ...c,
      desc: c.description,
      image: c.image || '',
      lessons: c.lessons || [],
      students_count: parseInt(c.students_count) || 0
    }))
    res.json(courses)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

module.exports = router