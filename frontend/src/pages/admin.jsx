import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, Plus, Trash2, Edit3,
  Image as ImageIcon, Upload, Video, Loader2, X, Save,
  TrendingUp, GraduationCap, BarChart3, Eye, Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { useNotification } from '../context/NotificationContext'
import '../styles/admin.css'

function Admin() {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0 })
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  // Course form
  const [form, setForm] = useState({
    id: '',
    title: '',
    category: 'Dasturlash',
    daraja: 'Boshlovchi',
    description: '',
    about: '',
    image: '',
    lessons: []
  })

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)

  // Video upload state per lesson
  const [uploadingVideo, setUploadingVideo] = useState({})

  // Material upload state per lesson
  const [uploadingMaterial, setUploadingMaterial] = useState({})

  useEffect(() => {
    if (!user || user.email !== 'admin@eduuz.uz') {
      navigate('/')
      return
    }
    document.title = "Admin Panel — EduUz"
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsRes.ok) setStats(statsData)

      // Courses
      const coursesRes = await fetch('http://localhost:5000/api/teacher/all-courses')
      const coursesData = await coursesRes.json()
      if (Array.isArray(coursesData)) setCourses(coursesData)

      // Users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      if (Array.isArray(usersData)) setUsers(usersData)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      id: '',
      title: '',
      category: 'Dasturlash',
      daraja: 'Boshlovchi',
      description: '',
      about: '',
      image: '',
      lessons: []
    })
    setEditingCourse(null)
    setShowCourseForm(false)
  }

  const startEdit = (course) => {
    setEditingCourse(course.id)
    setForm({
      id: course.id,
      title: course.title || '',
      category: course.category || 'Dasturlash',
      daraja: course.daraja || 'Boshlovchi',
      description: course.description || course.desc || '',
      about: course.about || '',
      image: course.image || '',
      lessons: Array.isArray(course.lessons) ? course.lessons : []
    })
    setShowCourseForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Image upload
  const uploadImage = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      addNotification('Rasm hajmi 5MB dan oshmasligi kerak', 'error')
      return
    }
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        setForm(prev => ({ ...prev, image: data.url }))
        addNotification('Rasm yuklandi!', 'success')
      } else {
        addNotification(data.message || 'Yuklashda xatolik', 'error')
      }
    } catch {
      addNotification('Server xatosi', 'error')
    }
    setUploadingImage(false)
  }

  // Video upload (faqat MP4)
  const uploadVideo = async (lessonIdx, file) => {
    if (!file) return

    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      addNotification('Faqat MP4 formatdagi video yuklash mumkin!', 'error')
      return
    }
    if (file.size > 500 * 1024 * 1024) {
      addNotification('Video hajmi 500MB dan oshmasligi kerak!', 'error')
      return
    }

    setUploadingVideo(prev => ({ ...prev, [lessonIdx]: true }))
    try {
      const fd = new FormData()
      fd.append('video', file)
      const res = await fetch('http://localhost:5000/api/upload/video', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        const newLessons = [...form.lessons]
        newLessons[lessonIdx] = {
          ...newLessons[lessonIdx],
          videoUrl: data.url,
          videoFile: data.filename,
          videoSize: data.sizeMB
        }
        setForm({ ...form, lessons: newLessons })
        addNotification(`Video yuklandi! (${data.sizeMB} MB)`, 'success')
      } else {
        addNotification(data.message || 'Yuklashda xatolik', 'error')
      }
    } catch (err) {
      console.error(err)
      addNotification('Server bilan bog\'lanib bo\'lmadi', 'error')
    }
    setUploadingVideo(prev => ({ ...prev, [lessonIdx]: false }))
  }

  // Material upload
  const uploadMaterial = async (lessonIdx, file) => {
    if (!file) return
    setUploadingMaterial(prev => ({ ...prev, [lessonIdx]: true }))
    try {
      const fd = new FormData()
      fd.append('material', file)
      const res = await fetch('http://localhost:5000/api/upload/material', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        const newLessons = [...form.lessons]
        newLessons[lessonIdx] = {
          ...newLessons[lessonIdx],
          materialUrl: data.url,
          materialName: file.name
        }
        setForm({ ...form, lessons: newLessons })
        addNotification('Material yuklandi!', 'success')
      }
    } catch {
      addNotification('Material yuklashda xatolik', 'error')
    }
    setUploadingMaterial(prev => ({ ...prev, [lessonIdx]: false }))
  }

  const removeLessonVideo = (lessonIdx) => {
    const newLessons = [...form.lessons]
    newLessons[lessonIdx] = {
      ...newLessons[lessonIdx],
      videoUrl: '',
      videoFile: '',
      videoSize: 0
    }
    setForm({ ...form, lessons: newLessons })
  }

  const addLesson = () => {
    setForm({
      ...form,
      lessons: [...form.lessons, { title: '', videoUrl: '', description: '', materialUrl: '' }]
    })
  }

  const removeLesson = (idx) => {
    const newLessons = form.lessons.filter((_, i) => i !== idx)
    setForm({ ...form, lessons: newLessons })
  }

  const saveCourse = async () => {
    console.log('Saving form:', form)
  console.log('Lessons:', form.lessons)
    if (!form.id || !form.title) {
      addNotification('ID va sarlavha to\'ldirilishi kerak', 'error')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          darslar: form.lessons.length
        })
      })

      if (res.ok) {
        addNotification(editingCourse ? 'Kurs yangilandi!' : 'Kurs yaratildi!', 'success')
        resetForm()
        loadData()
      } else {
        const data = await res.json()
        addNotification(data.message || 'Xatolik', 'error')
      }
    } catch {
      addNotification('Server xatosi', 'error')
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm('Kursni o\'chirishni xohlaysizmi?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        addNotification('Kurs o\'chirildi', 'success')
        loadData()
      }
    } catch {
      addNotification('Xatolik', 'error')
    }
  }

  if (loading) return (
    <div><Navbar /><Loading text="Admin panel yuklanmoqda..." /></div>
  )

  return (
    <div>
      <Navbar />
      <div className="admin-page">

        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <Sparkles size={24} />
            <span>Admin Panel</span>
          </div>

          <nav className="admin-nav">
            <button
              className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              className={`admin-nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={18} /> Kurslar
              <span className="admin-nav-badge">{courses.length}</span>
            </button>
            <button
              className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} /> Foydalanuvchilar
              <span className="admin-nav-badge">{users.length}</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <button className="btn-outline" onClick={() => navigate('/')}>
              Saytga qaytish
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="admin-content">
              <div className="admin-page-header">
                <h1>Dashboard</h1>
                <p>Platformangiz haqida umumiy ma'lumot</p>
              </div>

              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{stats.users}</div>
                    <div className="admin-stat-label">Foydalanuvchilar</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{stats.courses}</div>
                    <div className="admin-stat-label">Kurslar</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{stats.enrollments || 0}</div>
                    <div className="admin-stat-label">Yozilishlar</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="admin-stat-value">{users.length > 0 ? Math.round((stats.enrollments || 0) / users.length * 100) / 100 : 0}</div>
                    <div className="admin-stat-label">O'rtacha kurs/user</div>
                  </div>
                </div>
              </div>

              <div className="admin-section">
                <h3><BookOpen size={18} /> So'nggi kurslar</h3>
                <div className="admin-recent-list">
                  {courses.slice(0, 5).map(c => (
                    <div key={c.id} className="admin-recent-item">
                      <div className="admin-recent-thumb">
                        {c.image ? (
                          <img src={c.image} alt={c.title} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>
                      <div className="admin-recent-info">
                        <div className="admin-recent-title">{c.title}</div>
                        <div className="admin-recent-meta">
                          {c.category} • {c.daraja} • {c.lessons?.length || 0} dars
                        </div>
                      </div>
                      <button className="btn-outline btn-small" onClick={() => {
                        setActiveTab('courses')
                        setTimeout(() => startEdit(c), 100)
                      }}>
                        <Edit3 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            <div className="admin-content">
              <div className="admin-page-header">
                <div>
                  <h1>Kurslar</h1>
                  <p>Barcha kurslarni boshqarish</p>
                </div>
                {!showCourseForm && (
                  <button className="btn-primary" onClick={() => setShowCourseForm(true)}>
                    <Plus size={16} /> Yangi kurs
                  </button>
                )}
              </div>

              {/* Course Form */}
              {showCourseForm && (
                <div className="admin-form-card">
                  <div className="admin-form-header">
                    <h3>{editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}</h3>
                    <button className="btn-icon" onClick={resetForm}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kurs ID (URL uchun)</label>
                      <input
                        type="text"
                        value={form.id}
                        onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="masalan: python-asoslari"
                        disabled={!!editingCourse}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sarlavha</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="Kurs nomi"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kategoriya</label>
                      <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                      >
                        <option>Dasturlash</option>
                        <option>Matematika</option>
                        <option>Fizika</option>
                        <option>Til o'rganish</option>
                        <option>Dizayn</option>
                        <option>Biznes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Daraja</label>
                      <select
                        value={form.daraja}
                        onChange={e => setForm({ ...form, daraja: e.target.value })}
                      >
                        <option>Boshlovchi</option>
                        <option>O'rta</option>
                        <option>Ilg'or</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Qisqa tavsif</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Bir-ikki jumla"
                    />
                  </div>

                  <div className="form-group">
                    <label>To'liq haqida</label>
                    <textarea
                      value={form.about}
                      onChange={e => setForm({ ...form, about: e.target.value })}
                      placeholder="Kurs haqida batafsil..."
                      rows={4}
                    />
                  </div>

                  {/* Image upload */}
                  <div className="form-group">
                    <label>Kurs rasmi (max 5MB)</label>
                    {form.image ? (
                      <div className="image-uploaded">
                        <img src={form.image} alt="Preview" />
                        <button
                          type="button"
                          className="btn-outline btn-small"
                          onClick={() => setForm({ ...form, image: '' })}
                        >
                          <X size={14} /> O'chirish
                        </button>
                      </div>
                    ) : (
                      <div className="upload-box">
                        <input
                          type="file"
                          accept="image/*"
                          id="image-upload"
                          onChange={e => uploadImage(e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="image-upload" className="upload-label">
                          {uploadingImage ? (
                            <>
                              <Loader2 size={32} className="spin-icon" />
                              <span>Yuklanmoqda...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={32} />
                              <span>Rasm tanlash</span>
                              <small>JPG, PNG, WEBP — max 5MB</small>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* LESSONS */}
                  <div className="form-group">
                    <div className="lessons-header">
                      <label>Darslar ({form.lessons.length})</label>
                      <button type="button" className="btn-outline btn-small" onClick={addLesson}>
                        <Plus size={14} /> Yangi dars
                      </button>
                    </div>

                    {form.lessons.length === 0 ? (
                      <div className="lessons-empty">
                        <BookOpen size={32} />
                        <p>Hali darslar yo'q. "Yangi dars" tugmasini bosing.</p>
                      </div>
                    ) : (
                      <div className="lessons-list">
                        {form.lessons.map((lesson, idx) => (
                          <div key={idx} className="lesson-item">
                            <div className="lesson-item-header">
                              <span className="lesson-number">{idx + 1}-dars</span>
                              <button
                                type="button"
                                className="lesson-delete-btn"
                                onClick={() => removeLesson(idx)}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <div className="form-group">
                              <label>Dars sarlavhasi</label>
                              <input
                                type="text"
                                value={lesson.title || ''}
                                onChange={e => {
                                  const newLessons = [...form.lessons]
                                  newLessons[idx] = { ...newLessons[idx], title: e.target.value }
                                  setForm({ ...form, lessons: newLessons })
                                }}
                                placeholder="Masalan: Kirish va asosiy tushunchalar"
                              />
                            </div>

                            {/* VIDEO UPLOAD */}
                            <div className="form-group">
                              <label>Video fayl (.mp4 — max 500MB)</label>
                              {lesson.videoUrl ? (
                                <div className="video-uploaded">
                                  <div className="video-uploaded-info">
                                    <Video size={20} color="#22c55e" />
                                    <div>
                                      <div className="video-filename">{lesson.videoFile || 'video.mp4'}</div>
                                      <div className="video-size">{lesson.videoSize} MB</div>
                                    </div>
                                  </div>
                                  <video src={lesson.videoUrl} controls className="video-preview" />
                                  <button
                                    type="button"
                                    className="btn-outline btn-small"
                                    onClick={() => removeLessonVideo(idx)}
                                  >
                                    <X size={14} /> Videoni o'chirish
                                  </button>
                                </div>
                              ) : (
                                <div className="upload-box">
                                  <input
                                    type="file"
                                    accept="video/mp4,.mp4"
                                    id={`video-upload-${idx}`}
                                    onChange={e => uploadVideo(idx, e.target.files[0])}
                                    disabled={uploadingVideo[idx]}
                                    style={{ display: 'none' }}
                                  />
                                  <label htmlFor={`video-upload-${idx}`} className="upload-label">
                                    {uploadingVideo[idx] ? (
                                      <>
                                        <Loader2 size={32} className="spin-icon" />
                                        <span>Video yuklanmoqda...</span>
                                        <small>Iltimos kuting</small>
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={32} />
                                        <span>MP4 video tanlash</span>
                                        <small>Faqat .mp4 format, max 500MB</small>
                                      </>
                                    )}
                                  </label>
                                </div>
                              )}
                            </div>

                            <div className="form-group">
                              <label>Tavsif (ixtiyoriy)</label>
                              <textarea
                                value={lesson.description || ''}
                                onChange={e => {
                                  const newLessons = [...form.lessons]
                                  newLessons[idx] = { ...newLessons[idx], description: e.target.value }
                                  setForm({ ...form, lessons: newLessons })
                                }}
                                placeholder="Dars haqida qisqacha..."
                                rows={2}
                              />
                            </div>

                            {/* MATERIAL UPLOAD */}
                            <div className="form-group">
                              <label>Material fayl (ZIP/PDF — ixtiyoriy)</label>
                              {lesson.materialUrl ? (
                                <div className="material-uploaded">
                                  <Upload size={16} color="#22c55e" />
                                  <span>{lesson.materialName}</span>
                                  <button
                                    type="button"
                                    className="btn-outline btn-small"
                                    onClick={() => {
                                      const newLessons = [...form.lessons]
                                      newLessons[idx] = { ...newLessons[idx], materialUrl: '', materialName: '' }
                                      setForm({ ...form, lessons: newLessons })
                                    }}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  accept=".zip,.rar,.pdf,.docx,.pptx,.xlsx,.7z"
                                  onChange={e => uploadMaterial(idx, e.target.files[0])}
                                  disabled={uploadingMaterial[idx]}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button className="btn-outline" onClick={resetForm}>
                      Bekor qilish
                    </button>
                    <button className="btn-primary" onClick={saveCourse}>
                      <Save size={16} /> {editingCourse ? 'Yangilash' : 'Saqlash'}
                    </button>
                  </div>
                </div>
              )}

              {/* Courses List */}
              {!showCourseForm && (
                <div className="admin-courses-grid">
                  {courses.length === 0 ? (
                    <div className="admin-empty">
                      <BookOpen size={48} />
                      <h3>Hali kurslar yo'q</h3>
                      <p>Birinchi kursni qo'shing</p>
                      <button className="btn-primary" onClick={() => setShowCourseForm(true)}>
                        <Plus size={16} /> Yangi kurs
                      </button>
                    </div>
                  ) : (
                    courses.map(c => (
                      <div key={c.id} className="admin-course-card">
                        <div className="admin-course-thumb">
                          {c.image ? (
                            <img src={c.image} alt={c.title} />
                          ) : (
                            <BookOpen size={32} />
                          )}
                        </div>
                        <div className="admin-course-body">
                          <h4>{c.title}</h4>
                          <div className="admin-course-meta">
                            <span>{c.category}</span>
                            <span>•</span>
                            <span>{c.daraja}</span>
                            <span>•</span>
                            <span>{c.lessons?.length || 0} dars</span>
                          </div>
                          <p>{(c.description || c.desc || '').substring(0, 100)}...</p>
                        </div>
                        <div className="admin-course-actions">
                          <button className="btn-outline btn-small" onClick={() => navigate(`/courses/${c.id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn-outline btn-small" onClick={() => startEdit(c)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn-danger btn-small" onClick={() => deleteCourse(c.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="admin-content">
              <div className="admin-page-header">
                <h1>Foydalanuvchilar</h1>
                <p>Barcha ro'yxatdan o'tgan foydalanuvchilar</p>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ism</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Ro'yxatdan o'tgan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar" style={{
                              background: `linear-gradient(135deg, hsl(${u.id * 60 % 360}, 70%, 60%), hsl(${(u.id * 60 + 60) % 360}, 70%, 50%))`
                            }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-role ${u.email === 'admin@eduuz.uz' ? 'role-admin' : 'role-user'}`}>
                            {u.email === 'admin@eduuz.uz' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export default Admin