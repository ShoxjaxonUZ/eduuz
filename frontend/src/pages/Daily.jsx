import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, Trophy, Target, Calendar, Star, Zap,
  Send, Loader2, CheckCircle2, XCircle, Crown,
  Sparkles, Award, TrendingUp, Code2, Lock, Lightbulb,
  ChevronDown, RefreshCw, BookOpen, X
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { useNotification } from '../context/NotificationContext'
import '../styles/daily.css'

function Daily() {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [loading, setLoading] = useState(true)
  const [challenge, setChallenge] = useState(null)
  const [streak, setStreak] = useState({ current: 0, longest: 0, totalCompleted: 0, totalPoints: 0 })
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  // Kurslar
  const [myCourses, setMyCourses] = useState([])
  const [showCoursePicker, setShowCoursePicker] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const isCompleted = challenge?.status === 'completed'

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Kunlik masala — EduUz"
    loadAll()
  }, [])

  // Daily masala paytida sahifani himoya qilish
useEffect(() => {
  const isActive = challenge && !isCompleted

  if (!isActive) return

  // 1. Boshqa sahifaga o'tishni bloklash (URL ushlab turish)
  const lockUrl = () => {
    if (window.location.pathname !== '/daily') {
      window.history.replaceState(null, '', '/daily')
    }
  }
  window.history.pushState(null, '', '/daily')
  const urlInterval = setInterval(lockUrl, 200)

  // 2. Brauzer back tugmasi
  const handlePopState = () => {
    window.history.pushState(null, '', '/daily')
  }

  // 3. Brauzer yopish / refresh oldida ogohlantirish (lekin oldini olishga harakat)
  const handleBeforeUnload = (e) => {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }

  // 4. Tashqi link bosishni bloklash
  const handleClick = (e) => {
    const link = e.target.closest('a')
    if (link && link.getAttribute('href')) {
      const href = link.getAttribute('href')
      if (!href.includes('/daily') && !href.startsWith('#')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  // 5. Tezkor tugmalarni bloklash (F5, Ctrl+R, Ctrl+W, Ctrl+T, Ctrl+N, Alt+F4 va h.k.)
  const handleKeyDown = (e) => {
    // F5 — refresh
    if (e.key === 'F5') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+R — refresh
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+W — tab yopish
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+T — yangi tab
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+N — yangi oyna
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+Shift+N — incognito
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+Tab — tab almashtirish
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Alt+F4 — yopish
    if (e.altKey && e.key === 'F4') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Alt+Tab — dastur almashtirish
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+L — URL bar
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // F11 — fullscreen
    if (e.key === 'F11') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Backspace (URL bar bo'sh joyda) — back
    if (e.key === 'Backspace' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // 6. O'ng tugma menyusini bloklash
  const handleContextMenu = (e) => {
    e.preventDefault()
    return false
  }

  window.addEventListener('popstate', handlePopState)
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeyDown, true)
  window.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('click', handleClick, true)

  return () => {
    clearInterval(urlInterval)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('contextmenu', handleContextMenu)
    document.removeEventListener('click', handleClick, true)
  }
}, [challenge, isCompleted])

  const loadAll = async () => {
    setLoading(true)
    try {
      // Kurslar
      const coursesRes = await fetch('http://localhost:5000/api/daily/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const coursesData = await coursesRes.json()
      if (Array.isArray(coursesData)) setMyCourses(coursesData)

      // Bugungi masala
      const res = await fetch('http://localhost:5000/api/daily/today', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setChallenge(data.challenge)
        setStreak(data.streak)
        setCode(data.challenge.userCode || data.challenge.template || '')
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const regenerateChallenge = async (courseId) => {
    setRegenerating(true)
    try {
      const res = await fetch('http://localhost:5000/api/daily/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      })
      const data = await res.json()
      if (res.ok) {
        setChallenge(data.challenge)
        setCode(data.challenge.template || '')
        setResult(null)
        setShowCoursePicker(false)
        addNotification('Yangi masala yaratildi!', 'success')
      } else {
        addNotification(data.message || 'Xatolik', 'error')
      }
    } catch {
      addNotification('Server xatosi', 'error')
    }
    setRegenerating(false)
  }

  const submitSolution = async () => {
    if (!code.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/daily/submit/${challenge.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      })
      const data = await res.json()

      if (res.ok) {
        setResult(data)
        if (data.passed) {
          setStreak(prev => ({
            ...prev,
            current: data.newStreak,
            longest: data.longestStreak,
            totalCompleted: prev.totalCompleted + 1,
            totalPoints: prev.totalPoints + data.pointsEarned
          }))
          addNotification(`Ajoyib! +${data.pointsEarned} ball`, 'success')
        } else {
          addNotification(`Yechim noto'g'ri (${data.score} ball)`, 'error')
        }
        setChallenge(prev => ({ ...prev, status: data.passed ? 'completed' : 'failed' }))
      } else {
        addNotification(data.message || 'Xatolik', 'error')
      }
    } catch {
      addNotification('Server bilan bog\'lanib bo\'lmadi', 'error')
    }
    setSubmitting(false)
  }

  const calculateLevel = (points) => Math.floor(points / 100) + 1
  const getLevelProgress = (points) => points % 100

  const getRankInfo = (points) => {
    if (points < 50) return { name: 'Yangi boshlovchi', color: '#94a3b8', icon: Star }
    if (points < 200) return { name: 'O\'rganuvchi', color: '#0ea5e9', icon: Code2 }
    if (points < 500) return { name: 'Tajribali', color: '#22c55e', icon: Award }
    if (points < 1000) return { name: 'Mutaxassis', color: '#f59e0b', icon: Trophy }
    if (points < 2000) return { name: 'Master', color: '#a855f7', icon: Crown }
    return { name: 'Legend', color: '#ec4899', icon: Sparkles }
  }

  const getStreakEmoji = (days) => {
    if (days === 0) return '🆕'
    if (days < 3) return '🌱'
    if (days < 7) return '🔥'
    if (days < 14) return '💎'
    if (days < 30) return '⚡'
    return '👑'
  }

  if (loading) return (
    <div><Navbar /><Loading text="Bugungi masala yuklanmoqda..." /></div>
  )

  // Agar dasturlash kursi yo'q bo'lsa
  if (!challenge && myCourses.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="dly-page">
          <div className="dly-empty">
            <BookOpen size={64} />
            <h2>Hech qanday dasturlash kursi yo'q</h2>
            <p>Kunlik masala uchun avval dasturlash kursiga yoziling</p>
            <button className="dly-btn-primary" onClick={() => navigate('/courses')}>
              Kurslarni ko'rish
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!challenge) return (
    <div>
      <Navbar />
      <div className="dly-page">
        <div className="dly-empty">
          <Lightbulb size={64} />
          <h2>Masala topilmadi</h2>
          <button className="dly-btn-primary" onClick={loadAll}>Qayta urinish</button>
        </div>
      </div>
    </div>
  )

  const level = calculateLevel(streak.totalPoints)
  const rank = getRankInfo(streak.totalPoints)
  const RankIcon = rank.icon
  const levelProgress = getLevelProgress(streak.totalPoints)
  const isFailed = challenge.status === 'failed'
  const streakEmoji = getStreakEmoji(streak.current)

  const difficultyConfig = {
    easy: { label: 'Oson', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
    medium: { label: 'O\'rta', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    hard: { label: 'Qiyin', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
  }
  const diff = difficultyConfig[challenge.difficulty] || difficultyConfig.easy

  return (
    <div>
      <Navbar />
      <div className="dly-page">

        {/* HERO BAR */}
        <div className="dly-hero-bar">
          <div className="dly-hero-glow"></div>

          <div className="dly-level-section">
            <div className="dly-level-circle" style={{ background: `linear-gradient(135deg, ${rank.color}, ${rank.color}dd)` }}>
              <RankIcon size={28} color="white" />
              <div className="dly-level-num">LVL {level}</div>
            </div>
            <div className="dly-level-info">
              <div className="dly-rank-name" style={{ color: rank.color }}>{rank.name}</div>
              <div className="dly-username">{user.name}</div>
              <div className="dly-level-progress">
                <div className="dly-level-bar">
                  <div className="dly-level-fill" style={{
                    width: `${levelProgress}%`,
                    background: `linear-gradient(90deg, ${rank.color}, ${rank.color}cc)`
                  }}></div>
                </div>
                <span className="dly-level-text">{levelProgress}/100 → LVL {level + 1}</span>
              </div>
            </div>
          </div>

          <div className="dly-streak-section">
            <div className="dly-streak-emoji">{streakEmoji}</div>
            <div className="dly-streak-num">{streak.current}</div>
            <div className="dly-streak-label">kunlik streak</div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="dly-stats">
          <div className="dly-stat-card stat-flame">
            <Flame size={20} />
            <div className="dly-stat-info">
              <div className="dly-stat-num">{streak.current}</div>
              <div className="dly-stat-label">Hozirgi</div>
            </div>
          </div>
          <div className="dly-stat-card stat-trophy">
            <Trophy size={20} />
            <div className="dly-stat-info">
              <div className="dly-stat-num">{streak.longest}</div>
              <div className="dly-stat-label">Eng uzun</div>
            </div>
          </div>
          <div className="dly-stat-card stat-target">
            <Target size={20} />
            <div className="dly-stat-info">
              <div className="dly-stat-num">{streak.totalCompleted}</div>
              <div className="dly-stat-label">Yechilgan</div>
            </div>
          </div>
          <div className="dly-stat-card stat-zap">
            <Zap size={20} />
            <div className="dly-stat-info">
              <div className="dly-stat-num">{streak.totalPoints}</div>
              <div className="dly-stat-label">Jami ball</div>
            </div>
          </div>
        </div>

        {/* COURSE PICKER */}
        {!isCompleted && myCourses.length > 0 && (
          <div className="dly-course-picker-bar">
            <div className="dly-course-info">
              <BookOpen size={16} />
              <span>Masala manbai:</span>
              <strong className="dly-course-current">
                {challenge.language === 'python' ? 'Python' :
                 challenge.language === 'javascript' ? 'JavaScript' :
                 challenge.language === 'cpp' ? 'C++' :
                 challenge.language === 'php' ? 'PHP' :
                 challenge.language === 'java' ? 'Java' : challenge.language}
              </strong>
            </div>
            {myCourses.length > 1 && (
              <button
                className="dly-change-btn"
                onClick={() => setShowCoursePicker(true)}
                disabled={regenerating}
              >
                {regenerating ? (
                  <><Loader2 size={14} className="dly-spin" /> Almashtirilmoqda...</>
                ) : (
                  <><RefreshCw size={14} /> Boshqa kurs</>
                )}
              </button>
            )}
          </div>
        )}

        {/* RESULT BANNER */}
        {result && (
          <div className={`dly-result-banner ${result.passed ? 'banner-win' : 'banner-lose'}`}>
            <div className="dly-result-icon">
              {result.passed ? <Crown size={48} /> : <XCircle size={48} />}
            </div>
            <div className="dly-result-content">
              <h3>{result.passed ? 'AJOYIB!' : 'YECHIM NOTO\'G\'RI'}</h3>
              <p>{result.feedback}</p>
              <div className="dly-result-meta">
                <span><Star size={14} /> {result.score} ball</span>
                {result.passed && (
                  <>
                    <span><Zap size={14} /> +{result.pointsEarned}</span>
                    <span><Flame size={14} /> {result.newStreak} kun!</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}
        <div className="dly-main">
          {/* PROBLEM */}
          <div className="dly-problem-card">
            <div className="dly-problem-header">
              <div className="dly-problem-tags">
                <span className="dly-tag-difficulty" style={{
                  background: `${diff.color}20`,
                  color: diff.color,
                  borderColor: `${diff.color}40`,
                  boxShadow: `0 0 20px ${diff.glow}`
                }}>
                  <Target size={12} /> {diff.label}
                </span>
                <span className="dly-tag-lang">
                  <Code2 size={12} /> {challenge.language}
                </span>
                {isCompleted && (
                  <span className="dly-tag-done">
                    <CheckCircle2 size={12} /> Yechildi
                  </span>
                )}
              </div>
            </div>

            <div className="dly-problem-body">
              <h2 className="dly-problem-title">
                <Sparkles size={20} /> {challenge.title}
              </h2>
              <pre className="dly-problem-text">{challenge.text}</pre>
            </div>

            <div className="dly-tip-box">
              <Lightbulb size={16} />
              <div>
                <strong>Eslatma:</strong> Tahlil quyidagilarga qarab amalga oshiriladi: kod ishlash mantiqi, sintaksis, xato yo'qligi.
              </div>
            </div>
          </div>

          {/* EDITOR */}
          <div className="dly-editor-card">
            <div className="dly-editor-header">
              <div className="dly-editor-tabs">
                <span className="dly-editor-tab active">
                  main.{challenge.language === 'python' ? 'py' :
                        challenge.language === 'javascript' ? 'js' :
                        challenge.language === 'cpp' ? 'cpp' :
                        challenge.language === 'php' ? 'php' : 'java'}
                </span>
              </div>
              <div className="dly-editor-info">{code.length} belgi</div>
            </div>

            <textarea
              className="dly-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.target.selectionStart
                  const end = e.target.selectionEnd
                  setCode(code.substring(0, start) + '    ' + code.substring(end))
                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 4
                  }, 0)
                }
              }}
              spellCheck={false}
              disabled={isCompleted}
              placeholder="// Kodingizni shu yerga yozing..."
            />

            <div className="dly-editor-footer">
              <button
                className="dly-btn-primary"
                onClick={submitSolution}
                disabled={submitting || isCompleted || !code.trim()}
              >
                {submitting ? (
                  <><Loader2 size={16} className="dly-spin" /> AI tahlil qilmoqda...</>
                ) : isCompleted ? (
                  <><CheckCircle2 size={16} /> Yechildi</>
                ) : (
                  <><Send size={16} /> Yechimni yuborish</>
                )}
              </button>
            </div>
          </div>
        </div>

        {(isCompleted || isFailed) && (
          <div className="dly-tomorrow-banner">
            <Calendar size={32} />
            <div>
              <h3>Ertangacha!</h3>
              <p>Yangi masala har kuni soat 00:00 da chiqadi. Streak ni davom ettiring!</p>
            </div>
          </div>
        )}

        {/* COURSE PICKER MODAL */}
        {showCoursePicker && (
          <div className="dly-modal-overlay" onClick={() => !regenerating && setShowCoursePicker(false)}>
            <div className="dly-modal" onClick={e => e.stopPropagation()}>
              <div className="dly-modal-header">
                <div>
                  <h3><BookOpen size={20} /> Kursni tanlang</h3>
                  <p>Yangi masala tanlangan kurs mavzusiga moslab tuziladi</p>
                </div>
                <button className="dly-modal-close" onClick={() => setShowCoursePicker(false)} disabled={regenerating}>
                  <X size={18} />
                </button>
              </div>

              <div className="dly-courses-list">
                {myCourses.map(c => (
                  <button
                    key={c.id}
                    className="dly-course-item"
                    onClick={() => regenerateChallenge(c.id)}
                    disabled={regenerating}
                  >
                    <div className="dly-course-thumb">
                      {c.image ? (
                        <img src={c.image} alt={c.title} />
                      ) : (
                        <BookOpen size={24} />
                      )}
                    </div>
                    <div className="dly-course-details">
                      <div className="dly-course-title">{c.title}</div>
                      <div className="dly-course-meta">
                        <span>{c.category}</span>
                        <span>•</span>
                        <span>{c.daraja}</span>
                        <span>•</span>
                        <span className="dly-course-lang">
                          <Code2 size={11} /> {c.language}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                ))}
              </div>

              {regenerating && (
                <div className="dly-modal-loading">
                  <Loader2 size={20} className="dly-spin" />
                  AI yangi masala yaratmoqda...
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Daily