import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, BarChart3, Target, Play, Rocket, Check,
  Lock, Award, Globe, Clock, CheckCircle2, FileText
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Comments from '../components/Comments'
import Loading from '../components/Loading'
import '../styles/coursedetail.css'

const LESSONS_PER_TEST = 5

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [moduleTests, setModuleTests] = useState({})
  const [pageLoading, setPageLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [id])

  const loadCourse = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teacher/all-courses')
      const data = await res.json()
      if (Array.isArray(data)) {
        const found = data.find(k => String(k.id) === String(id))
        if (found) {
          const normalizedLessons = (found.lessons || []).map((l, i) => {
            if (!l) return { title: `${i + 1}-dars`, video: '', desc: '' }
            if (typeof l === 'string') return { title: l, video: '', desc: '' }
            if (typeof l === 'object') return {
              title: l.title || `${i + 1}-dars`,
              video: l.videoUrl || l.video || '',
              desc: l.description || l.desc || ''
            }
            return { title: `${i + 1}-dars`, video: '', desc: '' }
          })
          setCourse({ ...found, lessons: normalizedLessons })
          document.title = `${found.title} — EduUz`

          // Module testlarni tekshirish
          if (token) {
            const totalModules = Math.ceil(normalizedLessons.length / LESSONS_PER_TEST)
            for (let i = 0; i < totalModules; i++) {
              fetchModuleTestStatus(i)
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    }

    if (!token) {
      setPageLoading(false)
      return
    }

    try {
      const [myRes, progRes] = await Promise.all([
        fetch('http://localhost:5000/api/courses/my', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => []),
        fetch(`http://localhost:5000/api/courses/progress/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => [])
      ])

      if (Array.isArray(myRes)) {
        const en = myRes.find(e => String(e.course_id) === String(id))
        if (en) {
          setEnrolled(true)
          setProgress(en.progress)
        }
      }

      if (Array.isArray(progRes)) {
        const done = progRes.filter(l => l.completed).map(l => l.lesson_index)
        setCompletedLessons(done)
      }
    } catch (err) {
      console.error(err)
    }
    setPageLoading(false)
  }

  const fetchModuleTestStatus = async (moduleIdx) => {
    try {
      const res = await fetch(`http://localhost:5000/api/module-test/status/${id}/${moduleIdx}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setModuleTests(prev => ({ ...prev, [moduleIdx]: data }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEnroll = async () => {
    if (!token) return navigate('/login')
    setEnrolling(true)
    try {
      const res = await fetch('http://localhost:5000/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: String(id) })
      })
      if (res.ok) {
        setEnrolled(true)
      }
    } catch (err) { console.error(err) }
    setEnrolling(false)
  }

  const isLessonLocked = (lessonIndex) => {
    if (!enrolled) return true
    if (lessonIndex === 0) return false

    const groupIndex = Math.floor(lessonIndex / LESSONS_PER_TEST)
    if (groupIndex === 0) return false

    return !moduleTests[groupIndex - 1]?.passed
  }

  if (pageLoading) return (
    <div><Navbar /><Loading text="Kurs yuklanmoqda..." /></div>
  )

  if (!course) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <h2>Kurs topilmadi</h2>
        <button className="btn-primary" onClick={() => navigate('/courses')}>
          Kurslarga qaytish
        </button>
      </div>
    </div>
  )

  const lessonGroups = []
  for (let i = 0; i < course.lessons.length; i += LESSONS_PER_TEST) {
    lessonGroups.push(course.lessons.slice(i, i + LESSONS_PER_TEST))
  }

  return (
    <div>
      <Navbar />
      <div className="detail-page">
        {/* Hero */}
        <div className="detail-hero">
          {course.image ? (
            <img src={course.image} alt={course.title} className="detail-hero-img" />
          ) : (
            <div className="detail-hero-placeholder">
              <BookOpen size={80} />
            </div>
          )}
          <div className="detail-hero-info">
            <span className="badge badge-blue">{course.category}</span>
            <h1>{course.title}</h1>
            <p>{course.desc || course.description}</p>
            <div className="detail-meta">
              <span><BookOpen size={14} /> {course.lessons.length} dars</span>
              <span><BarChart3 size={14} /> {course.daraja}</span>
              <span><Target size={14} /> Har 5 darsdan modul testi</span>
            </div>
          </div>
        </div>

        <div className="detail-body">
          {/* Main */}
          <div className="detail-main">
            <div className="detail-section">
              <h3><BookOpen size={20} /> Kurs haqida</h3>
              <p>{course.about || course.desc || 'Kurs haqida ma\'lumot tez orada qo\'shiladi.'}</p>
            </div>

            <div className="detail-section">
              <h3><Target size={20} /> Darslar va testlar</h3>

              {lessonGroups.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  Darslar hali qo'shilmagan
                </p>
              ) : (
                lessonGroups.map((group, groupIdx) => {
                  const groupStartIdx = groupIdx * LESSONS_PER_TEST
                  const groupCompletedCount = group.filter((_, i) =>
                    completedLessons.includes(groupStartIdx + i)
                  ).length
                  const allGroupCompleted = groupCompletedCount === group.length
                  const testStatus = moduleTests[groupIdx]
                  const testPassed = testStatus?.passed
                  const canAttempt = testStatus?.canAttempt !== false
                  const groupLocked = groupIdx > 0 && !moduleTests[groupIdx - 1]?.passed

                  return (
                    <div key={groupIdx} className={`lesson-group ${groupLocked ? 'group-locked' : ''}`}>
                      <div className="lesson-group-header">
                        <div>
                          <span className="group-badge">
                            {groupIdx + 1}-qism
                          </span>
                          <strong style={{ marginLeft: '10px' }}>
                            {groupStartIdx + 1}-{groupStartIdx + group.length} darslar
                          </strong>
                        </div>
                        {enrolled && (
                          <span className="group-progress">
                            {groupCompletedCount} / {group.length}
                            {testPassed && <CheckCircle2 size={14} style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                          </span>
                        )}
                      </div>

                      {!groupLocked && (
                        <ul className="lessons-list">
                          {group.map((lesson, i) => {
                            const realIndex = groupStartIdx + i
                            const isCompleted = completedLessons.includes(realIndex)
                            return (
                              <li
                                key={realIndex}
                                className={`lesson-item ${isCompleted ? 'lesson-done' : ''} ${enrolled ? 'lesson-clickable' : ''}`}
                                onClick={() => {
                                  if (enrolled) navigate(`/courses/${id}/lessons/${realIndex}`)
                                }}
                              >
                                <span className="lesson-num">
                                  {isCompleted ? <Check size={14} /> : realIndex + 1}
                                </span>
                                <span>{lesson.title}</span>
                                {enrolled && isCompleted && (
                                  <span className="lesson-check">
                                    <CheckCircle2 size={18} />
                                  </span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      {groupLocked && (
                        <div className="group-locked-msg">
                          <Lock size={16} /> Avvalgi qism testidan o'ting
                        </div>
                      )}

                      {enrolled && !groupLocked && allGroupCompleted && (
                        <div className="group-test">
                          {testPassed ? (
                            <div className="test-passed">
                              <Check size={16} /> Modul testi o'tildi
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                {testStatus?.score}/20 ball
                              </span>
                            </div>
                          ) : !canAttempt ? (
                            <div className="test-blocked">
                              <Lock size={16} /> Bugun urinish qilingan
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                Ertaga qayta urinib ko'ring
                              </span>
                            </div>
                          ) : (
                            <button
                              className="btn-primary test-btn"
                              onClick={() => navigate(`/courses/${id}/module-test/${groupIdx}`)}
                            >
                              <FileText size={16} /> {groupIdx + 1}-qism modul testi
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <Comments courseId={id} />
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-price">Bepul</h3>
              {enrolled ? (
                <>
                  <div className="progress-bar" style={{ marginBottom: '12px' }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '16px' }}>
                    {progress}% bajarildi
                  </p>
                  <button
                    className="btn-primary full"
                    onClick={() => {
                      const nextLesson = completedLessons.length > 0
                        ? Math.max(...completedLessons) + 1
                        : 0
                      if (nextLesson < course.lessons.length && !isLessonLocked(nextLesson)) {
                        navigate(`/courses/${id}/lessons/${nextLesson}`)
                      } else {
                        navigate(`/courses/${id}/lessons/0`)
                      }
                    }}
                  >
                    <Play size={16} /> Davom etish
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary full"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>Yozilmoqda...</>
                  ) : (
                    <><Rocket size={16} /> Kursni boshlash</>
                  )}
                </button>
              )}

              <ul className="sidebar-features">
                <li><CheckCircle2 size={14} /> To'liq bepul</li>
                <li><Award size={14} /> Sertifikat beriladi</li>
                <li><Globe size={14} /> O'zbek tilida</li>
                <li><Clock size={14} /> Istalgan vaqtda o'qish</li>
                <li><Target size={14} /> Modul testi har 5 darsdan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail