import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, TrendingUp, CheckCircle2, Trophy, LayoutDashboard,
  GraduationCap, BarChart3, PlayCircle, Pause, Bot, User,
  Edit, ArrowRight, Award, Target
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import '../styles/dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [allCoursesList, setAllCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Dashboard — EduUz"

    const loadAll = async () => {
      try {
        const coursesRes = await fetch('http://localhost:5000/api/teacher/all-courses')
        const coursesData = await coursesRes.json()
        const allCourses = Array.isArray(coursesData) ? coursesData : []
        setAllCoursesList(allCourses)
        localStorage.setItem('courses', JSON.stringify(allCourses))

        const myRes = await fetch('http://localhost:5000/api/courses/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const myData = await myRes.json()
        if (Array.isArray(myData)) {
          const courses = myData.map(e => {
            const course = allCourses.find(c => String(c.id) === String(e.course_id))
            return { ...course, progress: e.progress, course_id: e.course_id }
          }).filter(c => c && c.title && c.title.trim() !== '')
          setEnrolledCourses(courses)
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    loadAll()
  }, [])

  if (loading) return (
    <div><Navbar /><Loading text="Dashboard yuklanmoqda..." /></div>
  )

  const certCount = enrolledCourses.filter(k => {
    const state = localStorage.getItem(`quiz_${user?.id}_${k.course_id}`)
    return state ? JSON.parse(state)?.passed : false
  }).length

  const totalLessons = enrolledCourses.reduce((acc, k) =>
    acc + Math.round(((k.progress || 0) / 100) * (k.lessons?.length || 8)), 0)

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((a, k) => a + (k.progress || 0), 0) / enrolledCourses.length)
    : 0

  const completedCourses = enrolledCourses.filter(k => k.progress === 100)
  const inProgressCourses = enrolledCourses.filter(k => k.progress > 0 && k.progress < 100)

  return (
    <div>
      <Navbar />
      <div className="dashboard-page">

        {/* Profil */}
        <div className="dash-profile">
          <div className="dash-avatar">{user.name[0].toUpperCase()}</div>
          <div className="dash-profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="profile-badge">
              <GraduationCap size={12} /> O'quvchi
            </span>
          </div>
          <button className="btn-outline" onClick={() => navigate('/profile')}>
            <Edit size={16} /> Profilni tahrirlash
          </button>
        </div>

        {/* Statistika */}
        <div className="dash-stats">
          {[
            { label: "Kurslar", value: enrolledCourses.length, Icon: BookOpen, color: "#8b5cf6" },
            { label: "O'rtacha progress", value: `${avgProgress}%`, Icon: TrendingUp, color: "#0ea5e9" },
            { label: "Darslar", value: totalLessons, Icon: CheckCircle2, color: "#22c55e" },
            { label: "Sertifikatlar", value: certCount, Icon: Trophy, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: s.color + '20', color: s.color }}>
                <s.Icon size={22} />
              </div>
              <div>
                <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablar */}
        <div className="dash-tabs">
          {[
            { key: 'overview', label: 'Umumiy', Icon: LayoutDashboard },
            { key: 'courses', label: 'Kurslarim', Icon: BookOpen },
            { key: 'results', label: 'Natijalar', Icon: Trophy },
          ].map(tab => (
            <button
              key={tab.key}
              className={`dash-tab ${activeTab === tab.key ? 'dash-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.Icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Umumiy tab */}
        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="dash-section">
              <h3>Kurslar holati</h3>
              <div className="dash-status-list">
                {[
                  { label: "Tugatilgan", Icon: CheckCircle2, count: completedCourses.length, color: "#22c55e" },
                  { label: "Davom etmoqda", Icon: PlayCircle, count: inProgressCourses.length, color: "#0ea5e9" },
                  { label: "Boshlanmagan", Icon: Pause, count: enrolledCourses.length - completedCourses.length - inProgressCourses.length, color: "#94a3b8" },
                ].map((s, i) => (
                  <div key={i} className="dash-status-item">
                    <div className="dash-status-info">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <s.Icon size={14} style={{ color: s.color }} /> {s.label}
                      </span>
                      <span style={{ color: s.color, fontWeight: '700' }}>{s.count} ta</span>
                    </div>
                    <div className="dash-status-bar">
                      <div className="dash-status-fill" style={{
                        width: `${enrolledCourses.length ? (s.count / enrolledCourses.length) * 100 : 0}%`,
                        background: s.color
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-section">
              <h3>Tezkor havolalar</h3>
              <div className="dash-quick-links">
                <div className="dash-quick-card" onClick={() => navigate('/courses')}>
                  <div className="quick-icon"><BookOpen size={28} /></div>
                  <p>Yangi kurs</p>
                </div>
                <div className="dash-quick-card" onClick={() => navigate('/ai-quiz')}>
                  <div className="quick-icon"><Bot size={28} /></div>
                  <p>AI test</p>
                </div>
                <div className="dash-quick-card" onClick={() => navigate('/profile')}>
                  <div className="quick-icon"><User size={28} /></div>
                  <p>Profil</p>
                </div>
                {certCount > 0 && (
                  <div className="dash-quick-card" onClick={() => setActiveTab('results')}>
                    <div className="quick-icon"><Trophy size={28} /></div>
                    <p>Sertifikatlar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kurslarim tab */}
        {activeTab === 'courses' && (
          <div className="dash-content">
            {enrolledCourses.length === 0 ? (
              <div className="dash-empty">
                <div className="empty-icon"><BookOpen size={48} /></div>
                <p>Hali hech qaysi kursga yozilmagansiz</p>
                <button className="btn-primary" onClick={() => navigate('/courses')}>
                  Kurslarga o'tish <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="dash-course-list">
                {enrolledCourses.map((kurs, i) => (
                  <div key={i} className="dash-course-item" onClick={() => navigate(`/courses/${kurs.course_id}`)}>
                    <div className="dash-course-left">
                      <span style={{ fontSize: '28px' }}>{kurs.emoji || '📚'}</span>
                      <div>
                        <h4>{kurs.title}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{kurs.category}</span>
                      </div>
                    </div>
                    <div className="dash-course-right">
                      <div className="dash-progress-wrap">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{
                            width: `${kurs.progress}%`,
                            background: kurs.progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #8b5cf6, #0ea5e9)'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-soft)', minWidth: '36px' }}>
                          {kurs.progress}%
                        </span>
                      </div>
                      {kurs.progress === 100 && (
                        <span className="dash-badge badge-green">
                          <CheckCircle2 size={12} /> Tugadi
                        </span>
                      )}
                      {kurs.progress > 0 && kurs.progress < 100 && (
                        <span className="dash-badge badge-blue">
                          <PlayCircle size={12} /> Davom etmoqda
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Natijalar tab */}
        {activeTab === 'results' && (
          <div className="dash-content">
            <div className="dash-results-grid">
              {enrolledCourses.filter(k => k.progress === 100).map((kurs, i) => {
                const quizState = localStorage.getItem(`quiz_${user?.id}_${kurs.course_id}`)
                const passed = quizState ? JSON.parse(quizState)?.passed : false
                return (
                  <div key={i} className="dash-result-card">
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>{kurs.emoji || '📚'}</div>
                    <h4>{kurs.title}</h4>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
                      <span className="dash-badge badge-green">
                        <CheckCircle2 size={12} /> Tugatildi
                      </span>
                      {passed && (
                        <span className="dash-badge badge-gold">
                          <Trophy size={12} /> Sertifikat
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {passed && (
                        <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}
                          onClick={() => navigate(`/certificate/${kurs.course_id}`)}>
                          <Award size={14} /> Sertifikat
                        </button>
                      )}
                      {!passed && (
                        <button className="btn-outline" style={{ fontSize: '13px', padding: '8px 14px' }}
                          onClick={() => navigate(`/courses/${kurs.course_id}`)}>
                          <Target size={14} /> Testga kirish
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {enrolledCourses.filter(k => k.progress === 100).length === 0 && (
                <div className="dash-empty">
                  <div className="empty-icon"><Trophy size={48} /></div>
                  <p>Hali hech qaysi kursni tugatmagansiz</p>
                  <button className="btn-primary" onClick={() => setActiveTab('courses')}>
                    Kurslarimga o'tish <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard