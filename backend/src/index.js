const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const courseRoutes = require('./routes/courses')
const adminRoutes = require('./routes/admin')
const aiRoutes = require('./routes/ai')
const commentRoutes = require('./routes/comments')
const teacherRoutes = require('./routes/teacher')
const path = require('path')
const uploadRoutes = require('./routes/upload')
const battleRoutes = require('./routes/battle')
const leaderboardRoutes = require('./routes/leaderboard')
const onboardingRoutes = require('./routes/onboarding')
const dailyRoutes = require('./routes/daily')
const moduleTestRoutes = require('./routes/moduleTest')

require('./db')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/upload', uploadRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'EduUz API ishlamoqda!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/battle', battleRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/daily', dailyRoutes)
app.use('/api/module-test', moduleTestRoutes)

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`)
})