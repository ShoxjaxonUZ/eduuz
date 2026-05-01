const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
})

pool.connect()
  .then(() => console.log('PostgreSQL ulandi! ✅'))
  .catch(err => console.error('PostgreSQL xatosi:', err.message))

module.exports = pool