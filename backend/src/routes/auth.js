const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    if (email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Bu email taqiqlangan' })
    }
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu email allaqachon mavjud' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    )

    const user = result.rows[0]

    const token = jwt.sign(
      { id: user.id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token noto\'g\'ri' })
  }
}

router.put('/update-name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body
    const { id } = req.user
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, id])
    res.json({ message: 'Ism yangilandi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.put('/update-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const { id } = req.user

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const user = result.rows[0]

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Eski parol noto\'g\'ri' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id])

    res.json({ message: 'Parol yangilandi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

module.exports = router