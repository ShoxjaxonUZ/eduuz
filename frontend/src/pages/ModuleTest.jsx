import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Trophy,
  Loader2, Sparkles, Clock, Target, BookOpen, ChevronRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { useNotification } from '../context/NotificationContext'
import '../styles/moduletest.css'

function ModuleTest() {
  const { courseId, moduleIndex } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState(null)
  const [view, setView] = useState('intro') // intro, test, result, blocked

  const moduleIdx = parseInt(moduleIndex)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = `Modul ${moduleIdx + 1} testi — EduUz`
    loadData()
  }, [courseId, moduleIndex])

  const loadData = async () => {
    setLoading(true)
    try {
      // Kurs
      const courseRes = await fetch('http://localhost:5000/api/teacher/all-courses')
      const courses = await courseRes.json()
      const found = courses.find(c => String(c.id) === String(courseId))
      setCourse(found)

      // Status
      const statusRes = await fetch(`http://localhost:5000/api/module-test/status/${courseId}/${moduleIdx}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const statusData = await statusRes.json()
      setStatus(statusData)

      if (statusData.passed) {
        setView('passed')
      } else if (!statusData.canAttempt) {
        setView('blocked')
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const startTest = async () => {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:5000/api/module-test/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, moduleIndex: moduleIdx })
      })
      const data = await res.json()

      if (res.ok) {
        setQuestions(data.questions)
        setView('test')
        setCurrentQ(0)
        setAnswers({})
      } else if (res.status === 429) {
        setView('blocked')
        addNotification(data.message, 'error')
      } else {
        addNotification(data.message || 'Xatolik', 'error')
      }
    } catch {
      addNotification('Server bilan bog\'lanib bo\'lmadi', 'error')
    }
    setGenerating(false)
  }

  const selectAnswer = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const submitTest = async () => {
    if (Object.keys(answers).length < questions.length) {
      const unanswered = questions.length - Object.keys(answers).length
      if (!confirm(`${unanswered} ta savolga javob bermadingiz. Yuboraylikmi?`)) {
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5000/api/module-test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          moduleIndex: moduleIdx,
          questions,
          answers
        })
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setView('result')
      }
    } catch {
      addNotification('Server xatosi', 'error')
    }
    setSubmitting(false)
  }

  if (loading) return <div><Navbar /><Loading text="Yuklanmoqda..." /></div>

  // ============ ALREADY PASSED ============
  if (view === 'passed') {
    return (
      <div>
        <Navbar />
        <div className="mtest-page">
          <div className="mtest-container">
            <div className="mtest-passed">
              <div className="mtest-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <CheckCircle2 size={64} color="white" />
              </div>
              <h1>Bu modulni allaqachon tugatgansiz!</h1>
              <p>Sizning natijangiz: <strong>{status?.score} / 20</strong></p>
              <button className="btn-primary btn-hero" onClick={() => {
                const nextLesson = (moduleIdx + 1) * 5
                navigate(`/courses/${courseId}/lessons/${nextLesson}`)
              }}>
                Keyingi darsga o'tish <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ BLOCKED ============
  if (view === 'blocked') {
    return (
      <div>
        <Navbar />
        <div className="mtest-page">
          <div className="mtest-container">
            <div className="mtest-blocked">
              <div className="mtest-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <Clock size={64} color="white" />
              </div>
              <h1>Bugun urinish qilingan</h1>
              <p>Modul testidan o'tolmadingiz. <strong>Ertaga</strong> qayta urinib ko'ring.</p>
              {status?.lastAttempt && (
                <div className="mtest-last-attempt">
                  <Target size={20} color="#f59e0b" />
                  Oxirgi natija: <strong>{status.lastAttempt.score} / 20</strong>
                  <span className="mtest-fail-badge">O'tmadi</span>
                </div>
              )}
              <button className="btn-outline" onClick={() => navigate(`/courses/${courseId}`)}>
                <ArrowLeft size={16} /> Kursga qaytish
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ INTRO ============
  if (view === 'intro') {
    return (
      <div>
        <Navbar />
        <div className="mtest-page">
          <div className="mtest-container">
            <div className="mtest-intro">
              <div className="mtest-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                <Sparkles size={64} color="white" />
              </div>
              <div className="mtest-badge">
                Modul {moduleIdx + 1} testi
              </div>
              <h1>{course?.title}</h1>
              <p className="mtest-sub">
                {moduleIdx * 5 + 1} - {moduleIdx * 5 + 5} darslar bo'yicha bilimingizni tekshiring
              </p>

              <div className="mtest-rules">
                <div className="mtest-rule">
                  <BookOpen size={20} color="#8b5cf6" />
                  <div>
                    <strong>20 ta savol</strong>
                    <span>AI tomonidan yaratilgan</span>
                  </div>
                </div>
                <div className="mtest-rule">
                  <Target size={20} color="#22c55e" />
                  <div>
                    <strong>80% kerak</strong>
                    <span>Kamida 16 ta to'g'ri</span>
                  </div>
                </div>
                <div className="mtest-rule">
                  <AlertCircle size={20} color="#f59e0b" />
                  <div>
                    <strong>1 marta urinish</strong>
                    <span>Yutqazsangiz, ertaga</span>
                  </div>
                </div>
              </div>

              <div className="mtest-warning">
                <AlertCircle size={16} />
                Ehtiyot bo'ling — bugungi urinishingiz oxirgi. Tayyor bo'lganingizda boshlang.
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-outline" onClick={() => navigate(`/courses/${courseId}`)}>
                  <ArrowLeft size={16} /> Keyinroq
                </button>
                <button className="btn-primary btn-hero" onClick={startTest} disabled={generating}>
                  {generating ? (
                    <><Loader2 size={18} className="spin" /> Savollar tayyorlanmoqda...</>
                  ) : (
                    <><Sparkles size={18} /> Testni boshlash</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ RESULT ============
  if (view === 'result' && result) {
    return (
      <div>
        <Navbar />
        <div className="mtest-page">
          <div className="mtest-container">
            <div className="mtest-result">
              <div className="mtest-icon" style={{
                background: result.passed
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)'
              }}>
                {result.passed ? <Trophy size={64} color="white" /> : <XCircle size={64} color="white" />}
              </div>

              <h1>{result.passed ? 'Tabriklaymiz!' : 'Test o\'tilmadi'}</h1>
              <p className="mtest-result-sub">
                {result.passed
                  ? 'Modul testidan muvaffaqiyatli o\'tdingiz!'
                  : 'Yetarli ball to\'play olmadingiz. Ertaga qayta urinib ko\'ring.'
                }
              </p>

              <div className="mtest-score-circle">
                <div className="score-num">{result.score}</div>
                <div className="score-total">/ {result.total}</div>
                <div className="score-percent">{result.percentage}%</div>
              </div>

              <div className="mtest-stats">
                <div className="mtest-stat">
                  <CheckCircle2 size={18} color="#22c55e" />
                  <span><strong>{result.score}</strong> to'g'ri</span>
                </div>
                <div className="mtest-stat">
                  <XCircle size={18} color="#ef4444" />
                  <span><strong>{result.total - result.score}</strong> noto'g'ri</span>
                </div>
                <div className="mtest-stat">
                  <Target size={18} color="#f59e0b" />
                  <span>Kerak edi: <strong>16</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                <button className="btn-outline" onClick={() => navigate(`/courses/${courseId}`)}>
                  <ArrowLeft size={16} /> Kursga qaytish
                </button>
                {result.passed && (
                  <button className="btn-primary btn-hero" onClick={() => {
                    const nextLesson = (moduleIdx + 1) * 5
                    navigate(`/courses/${courseId}/lessons/${nextLesson}`)
                  }}>
                    Keyingi darsga o'tish <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ TEST ============
  if (view === 'test' && questions.length > 0) {
    const q = questions[currentQ]
    const progress = ((currentQ + 1) / questions.length) * 100
    const answeredCount = Object.keys(answers).length

    return (
      <div>
        <Navbar />
        <div className="mtest-page">
          <div className="mtest-container">

            {/* Progress bar */}
            <div className="mtest-progress-wrap">
              <div className="mtest-progress-bar">
                <div className="mtest-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="mtest-progress-info">
                <span>Savol {currentQ + 1} / {questions.length}</span>
                <span>Javob berildi: {answeredCount}/{questions.length}</span>
              </div>
            </div>

            <div className="mtest-quiz">
              <div className="mtest-question-card">
                <div className="mtest-q-num">Savol {currentQ + 1}</div>
                <h2 className="mtest-q-text">{q.question}</h2>

                <div className="mtest-options">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`mtest-option ${answers[currentQ] === i ? 'mtest-option-active' : ''}`}
                      onClick={() => selectAnswer(currentQ, i)}
                    >
                      <span className="mtest-opt-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="mtest-opt-text">{opt}</span>
                      {answers[currentQ] === i && <CheckCircle2 size={18} color="#22c55e" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="mtest-nav">
                <button
                  className="btn-outline"
                  onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                >
                  <ArrowLeft size={16} /> Oldingi
                </button>

                {currentQ < questions.length - 1 ? (
                  <button
                    className="btn-primary"
                    onClick={() => setCurrentQ(q => q + 1)}
                    disabled={answers[currentQ] === undefined}
                  >
                    Keyingi <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn-primary btn-hero"
                    onClick={submitTest}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="spin" /> Tekshirilmoqda...</>
                    ) : (
                      <><CheckCircle2 size={18} /> Yakunlash</>
                    )}
                  </button>
                )}
              </div>

              {/* Question grid */}
              <div className="mtest-question-grid">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    className={`mtest-q-btn ${i === currentQ ? 'q-current' : ''} ${answers[i] !== undefined ? 'q-answered' : ''}`}
                    onClick={() => setCurrentQ(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ModuleTest