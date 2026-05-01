import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/teacher.css'

const emptyLesson = { title: '', video: '', desc: '', isUploading: false }
const emptyForm = {
  title: '',
  category: 'Dasturlash',
  daraja: "Boshlang'ich",
  desc: '',
  about: '',
}

const getCategoryIcon = (title) => {
  const t = title.toLowerCase()
  if (t.includes('python')) return '🐍'
  if (t.includes('javascript') || t.includes('js')) return '⚡'
  if (t.includes('react')) return '⚛️'
  if (t.includes('matematika')) return '📐'
  if (t.includes('fizika')) return '⚗️'
  if (t.includes('ingliz')) return '🇬🇧'
  if (t.includes('rus')) return '🇷🇺'
  if (t.includes('dizayn')) return '🎨'
  return '📚'
}

function TeacherDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')
  const [myCourses, setMyCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [lessons, setLessons] = useState([{ ...emptyLesson }])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "O'qituvchi paneli — EduUz"

    fetch('http://localhost:5000/api/teacher/my-status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setRole(data.role)
        if (data.role !== 'teacher') {
          navigate('/teacher/apply')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    loadMyCourses()
  }, [])

  const loadMyCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teacher/all-courses')
      const data = await res.json()
      if (Array.isArray(data)) {
        const mine = data.filter(c => String(c.teacher_id) === String(user?.id))
        setMyCourses(mine)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addLesson = () => {
    setLessons([...lessons, { ...emptyLesson }])
  }

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index))
  }

  const updateLesson = (index, field, value) => {
    setLessons(lessons.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  const handleVideoUpload = async (index, file) => {
    if (!file) return
    updateLesson(index, 'isUploading', true)

    const formData = new FormData()
    formData.append('video', file)

    try {
      const res = await fetch('http://localhost:5000/api/upload/video', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        updateLesson(index, 'video', data.url)
        updateLesson(index, 'isUploading', false)
      } else {
        alert('Video yuklashda xatolik: ' + data.message)
        updateLesson(index, 'isUploading', false)
      }
    } catch (err) {
      alert('Xatolik yuz berdi')
      updateLesson(index, 'isUploading', false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Kurs nomini kiriting!')
    setSaving(true)
    setMsg('')

    const validLessons = lessons.filter(l => l.title.trim())
    const emoji = getCategoryIcon(form.title)
    const id = Date.now().toString()

    const courseData = {
      id,
      title: form.title,
      category: form.category,
      daraja: form.daraja,
      emoji,
      desc: form.desc,
      about: form.about,
      lessons: validLessons.map(l => ({
        title: l.title,
        video: l.video || '',
        desc: l.desc || ''
      })),
      darslar: validLessons.length,
      teacher_id: user.id,
      teacher_name: user.name
    }

    try {
      const res = await fetch('http://localhost:5000/api/teacher/save-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      })

      const data = await res.json()

      if (res.ok) {
        setMsg('✅ Kurs muvaffaqiyatli qo\'shildi!')
        setForm(emptyForm)
        setLessons([{ ...emptyLesson }])
        setShowForm(false)

        // localStorage ni yangilash
        const allRes = await fetch('http://localhost:5000/api/teacher/all-courses')
        const allCourses = await allRes.json()
        if (Array.isArray(allCourses)) {
          localStorage.setItem('courses', JSON.stringify(allCourses))
        }

        loadMyCourses()
      } else {
        setMsg('❌ ' + data.message)
      }
    } catch (err) {
      setMsg('❌ Xatolik: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return (
    <div><Navbar /><div style={{ textAlign: 'center', padding: '80px' }}>Yuklanmoqda...</div></div>
  )

  return (
    <div>
      <Navbar />
      <div className="teacher-dashboard">

        {/* Header */}
        <div className="teacher-dash-header">
          <div>
            <h2>🎓 O'qituvchi paneli</h2>
            <p>Xush kelibsiz, {user?.name}!</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Yangi kurs
          </button>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === 'courses' ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab('courses')}>📚 Mening kurslarim</button>
          <button className={`dash-tab ${activeTab === 'stats' ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab('stats')}>📊 Statistika</button>
        </div>

        {msg && (
          <div style={{
            background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: msg.includes('✅') ? '#16a34a' : '#dc2626',
            padding: '12px 16px', borderRadius: '10px', fontSize: '14px'
          }}>
            {msg}
          </div>
        )}

        {/* Kurs qo'shish formasi */}
        {showForm && (
          <div className="teacher-form-section">
            <div className="teacher-form-header-row">
              <h3>Yangi kurs qo'shish</h3>
              <button className="btn-outline" onClick={() => setShowForm(false)}>✕ Yopish</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kurs nomi *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{getCategoryIcon(form.title)}</span>
                  <input
                    style={{ flex: 1 }}
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Masalan: Python dasturlash"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Toifa</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Dasturlash</option>
                  <option>Fan</option>
                  <option>Til</option>
                  <option>Dizayn</option>
                  <option>Biznes</option>
                  <option>Boshqa</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Daraja</label>
                <select value={form.daraja} onChange={e => setForm({ ...form, daraja: e.target.value })}>
                  <option>Boshlang'ich</option>
                  <option>O'rta</option>
                  <option>Yuqori</option>
                </select>
              </div>
              <div className="form-group">
                <label>Qisqa tavsif</label>
                <input
                  value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })}
                  placeholder="Kurs haqida qisqacha"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>To'liq tavsif</label>
              <textarea
                value={form.about}
                onChange={e => setForm({ ...form, about: e.target.value })}
                placeholder="Kurs haqida batafsil..."
                rows={3}
                style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Darslar */}
            <div className="teacher-lessons-section">
              <div className="lessons-form-header">
                <h4>📚 Darslar ({lessons.length} ta)</h4>
                <button className="btn-add-lesson" onClick={addLesson}>+ Dars qo'shish</button>
              </div>

              {lessons.map((lesson, i) => (
                <div key={i} className="teacher-lesson-item">
                  <div className="lesson-form-num">{i + 1}</div>
                  <div className="teacher-lesson-fields">
                    <input
                      placeholder="Dars nomi *"
                      value={lesson.title}
                      onChange={e => updateLesson(i, 'title', e.target.value)}
                    />
                    <input
                      placeholder="Dars tavsifi (ixtiyoriy)"
                      value={lesson.desc}
                      onChange={e => updateLesson(i, 'desc', e.target.value)}
                    />

                    {/* Video qo'shish */}
                    <div className="teacher-video-section">
                      {lesson.video ? (
                        <div className="teacher-video-preview">
                          <video
                            src={lesson.video}
                            controls
                            style={{ width: '100%', maxHeight: '200px', borderRadius: '8px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                              placeholder="Yoki YouTube havolasi"
                              value={lesson.video.startsWith('http://localhost') ? '' : lesson.video}
                              onChange={e => updateLesson(i, 'video', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}
                            />
                            <button
                              className="btn-delete"
                              onClick={() => updateLesson(i, 'video', '')}
                            >
                              🗑️ O'chirish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="teacher-video-upload">
                          <label className="video-upload-btn">
                            {lesson.isUploading ? (
                              <span>
                                <span style={{
                                  display: 'inline-block',
                                  width: '14px',
                                  height: '14px',
                                  border: '2px solid #7c3aed',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 0.8s linear infinite',
                                  marginRight: '6px',
                                  verticalAlign: 'middle'
                                }}></span>
                                Yuklanmoqda...
                              </span>
                            ) : (
                              <span>🎬 MP4 video yuklash</span>
                            )}
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/mov"
                              style={{ display: 'none' }}
                              disabled={lesson.isUploading}
                              onChange={e => handleVideoUpload(i, e.target.files[0])}
                            />
                          </label>
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>yoki</span>
                          <input
                            placeholder="YouTube havolasi..."
                            onChange={e => updateLesson(i, 'video', e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {lessons.length > 1 && (
                    <button className="lesson-form-remove" onClick={() => removeLesson(i)}>🗑️</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-outline" onClick={() => { setShowForm(false); setForm(emptyForm); setLessons([{ ...emptyLesson }]) }}>
                Bekor qilish
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saqlanmoqda...' : '💾 Kursni saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* Kurslar tab */}
        {activeTab === 'courses' && (
          <div>
            {myCourses.length === 0 ? (
              <div className="teacher-empty">
                <p>📚</p>
                <h3>Hali kurs qo'shmagansiz</h3>
                <p>Birinchi kursni yarating!</p>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  + Kurs qo'shish
                </button>
              </div>
            ) : (
              <div className="teacher-courses-grid">
                {myCourses.map((course, i) => (
                  <div key={i} className="teacher-course-card">
                    <div className="teacher-course-top">
                      <span style={{ fontSize: '32px' }}>{course.emoji}</span>
                      <div>
                        <h4>{course.title}</h4>
                        <span className="badge badge-blue">{course.category}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0' }}>
                      {course.desc || course.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                        📚 {course.lessons?.length || 0} dars
                      </span>
                      <button className="btn-edit" onClick={() => navigate(`/courses/${course.id}`)}>
                        Ko'rish →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistika tab */}
        {activeTab === 'stats' && (
          <div className="teacher-stats">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: '#f3f0ff', color: '#7c3aed' }}>📚</div>
              <div>
                <div className="dash-stat-value" style={{ color: '#7c3aed' }}>{myCourses.length}</div>
                <div className="dash-stat-label">Mening kurslarim</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default TeacherDashboard