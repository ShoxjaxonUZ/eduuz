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

router.get('/:course_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.text, c.created_at, u.name, u.id as user_id
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.course_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.course_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { course_id, text } = req.body
    if (!text?.trim()) return res.status(400).json({ message: 'Izoh bo\'sh bo\'lmasin' })

    const result = await pool.query(
      `INSERT INTO comments (user_id, course_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
      [req.user.id, course_id, text.trim()]
    )

    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])

    res.json({
      ...result.rows[0],
      name: userResult.rows[0].name,
      user_id: req.user.id
    })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await pool.query('SELECT * FROM comments WHERE id = $1', [req.params.id])
    if (comment.rows.length === 0) return res.status(404).json({ message: 'Topilmadi' })
    if (comment.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }
    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id])
    res.json({ message: 'O\'chirildi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

module.exports = router