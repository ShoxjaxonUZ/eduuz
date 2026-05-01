const pool = require('./src/db')
const bcrypt = require('bcryptjs')
require('dotenv').config()

async function seed() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = 'Admin'

  const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  if (exists.rows.length > 0) {
    console.log('Admin allaqachon mavjud!')
    process.exit()
  }

  const hashed = await bcrypt.hash(password, 10)
  await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
    [name, email, hashed]
  )
  console.log('Admin yaratildi! ✅')
  console.log('Email:', email)
  console.log('Parol:', password)
  process.exit()
}

seed()