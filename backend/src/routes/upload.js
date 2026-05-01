const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// =========== IMAGE UPLOAD ===========
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, 'img-' + unique + ext)
  }
})

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Faqat rasm formatlari qabul qilinadi (JPG, PNG, WEBP)'))
    }
    cb(null, true)
  }
})

router.post('/image', imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Rasm yuklanmadi' })
  }
  const url = `http://localhost:5000/uploads/images/${req.file.filename}`
  res.json({
    url,
    filename: req.file.filename,
    size: req.file.size
  })
})

// =========== VIDEO UPLOAD (FAQAT MP4) ===========
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/videos')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'video-' + unique + '.mp4')
  }
})

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'video/mp4') {
      return cb(new Error('Faqat MP4 formatdagi video qabul qilinadi!'))
    }
    if (!file.originalname.toLowerCase().endsWith('.mp4')) {
      return cb(new Error('Fayl kengaytmasi .mp4 bo\'lishi kerak!'))
    }
    cb(null, true)
  }
})

router.post('/video', videoUpload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Video yuklanmadi' })
  }
  const url = `http://localhost:5000/uploads/videos/${req.file.filename}`
  res.json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    sizeMB: (req.file.size / (1024 * 1024)).toFixed(2)
  })
})

// =========== MATERIAL UPLOAD ===========
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/materials')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, 'mat-' + unique + ext)
  }
})

const materialUpload = multer({
  storage: materialStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.zip', '.rar', '.pdf', '.docx', '.pptx', '.xlsx', '.7z']
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.includes(ext)) {
      return cb(new Error('Bu format qo\'llab-quvvatlanmaydi'))
    }
    cb(null, true)
  }
})

router.post('/material', materialUpload.single('material'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Material yuklanmadi' })
  }
  const url = `http://localhost:5000/uploads/materials/${req.file.filename}`
  res.json({
    url,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  })
})

// Multer xatolarini ushlash
router.use((err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err)
    return res.status(400).json({ message: err.message })
  }
  next()
})

module.exports = router