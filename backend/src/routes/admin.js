const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const pool = require('../db')

// Auth middleware
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

// Admin only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.email !== 'admin@eduuz.uz') {
    return res.status(403).json({ message: 'Faqat admin uchun' })
  }
  next()
}

// STATS
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const usersRes = await pool.query("SELECT COUNT(*) FROM users WHERE email != 'admin@eduuz.uz'")
    const coursesRes = await pool.query('SELECT COUNT(*) FROM courses')
    const enrollmentsRes = await pool.query('SELECT COUNT(*) FROM enrollments')

    res.json({
      users: parseInt(usersRes.rows[0].count) || 0,
      courses: parseInt(coursesRes.rows[0].count) || 0,
      enrollments: parseInt(enrollmentsRes.rows[0].count) || 0
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// USERS
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// CREATE / UPDATE COURSE
router.post('/courses', auth, adminOnly, async (req, res) => {
  console.log('=== COURSE SAVE ===')
  console.log('Lessons count:', req.body.lessons?.length)

  try {
    const {
      id, title, category, daraja, description, about,
      image, lessons, darslar
    } = req.body

    if (!id || !title) {
      return res.status(400).json({ message: 'ID va sarlavha to\'ldirilishi kerak' })
    }

    const existing = await pool.query('SELECT id FROM courses WHERE id = $1', [id])
    const lessonsJson = JSON.stringify(lessons || [])

    if (existing.rows.length > 0) {
      await pool.query(`
        UPDATE courses 
        SET title = $1, category = $2, daraja = $3, description = $4, 
            about = $5, image = $6, lessons = $7::jsonb, darslar = $8
        WHERE id = $9
      `, [
        title,
        category || 'Dasturlash',
        daraja || 'Boshlovchi',
        description || '',
        about || '',
        image || '',
        lessonsJson,
        darslar || (lessons?.length || 0),
        id
      ])
      res.json({ message: 'Kurs yangilandi', id })
    } else {
      await pool.query(`
        INSERT INTO courses (id, title, category, daraja, description, about, image, lessons, darslar, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, NOW())
      `, [
        id,
        title,
        category || 'Dasturlash',
        daraja || 'Boshlovchi',
        description || '',
        about || '',
        image || '',
        lessonsJson,
        darslar || (lessons?.length || 0)
      ])
      res.json({ message: 'Kurs yaratildi', id })
    }
  } catch (err) {
    console.error('Course save error:', err)
    res.status(500).json({ message: err.message })
  }
})

// DELETE COURSE
router.delete('/courses/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id])
    res.json({ message: 'Kurs o\'chirildi' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router