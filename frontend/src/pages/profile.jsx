import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Swords, Lock, LogOut, Save, Crown, Gem, Star,
  Sprout, Shield, GraduationCap, AlertTriangle, ArrowRight, Trophy
} from 'lucide-react'
import Navbar from '../components/Navbar'
import '../styles/profile.css'

function Profile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [nameForm, setNameForm] = useState({ name: user?.name || '' })
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [nameMsg, setNameMsg] = useState(null)
  const [passMsg, setPassMsg] = useState(null)
  const [nameLoading, setNameLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [rating, setRating] = useState(null)
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [certCount, setCertCount] = useState(0)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Profil — EduUz"

    fetch('http://localhost:5000/api/battle/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const me = data.find(p => p.name === user.name)
          if (me) setRating(me)
        }
      })
      .catch(console.error)

    fetch('http://localhost:5000/api/courses/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnrolledCount(data.length)
          const certs = data.filter(e => {
            const state = localStorage.getItem(`quiz_${user.id}_${e.course_id}`)
            return state ? JSON.parse(state)?.passed : false
          })
          setCertCount(certs.length)
        }
      })
      .catch(console.error)
  }, [])

  const handleNameUpdate = async () => {
    if (!nameForm.name.trim()) return setNameMsg({ text: 'Ism bo\'sh bo\'lmasin', ok: false })
    setNameLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: nameForm.name })
      })
      const data = await res.json()
      if (res.ok) {
        const updated = { ...user, name: nameForm.name }
        localStorage.setItem('user', JSON.stringify(updated))
        setNameMsg({ text: 'Ism muvaffaqiyatli yangilandi!', ok: true })
      } else {
        setNameMsg({ text: data.message, ok: false })
      }
    } catch {
      setNameMsg({ text: 'Server bilan bog\'lanib bo\'lmadi', ok: false })
    }
    setNameLoading(false)
  }

  const handlePassUpdate = async () => {
    if (!passForm.oldPassword || !passForm.newPassword) {
      return setPassMsg({ text: 'Barcha maydonlarni to\'ldiring', ok: false })
    }
    if (passForm.newPassword !== passForm.confirm) {
      return setPassMsg({ text: 'Yangi parollar mos kelmadi', ok: false })
    }
    if (passForm.newPassword.length < 6) {
      return setPassMsg({ text: 'Parol kamida 6 ta belgi bo\'lsin', ok: false })
    }
    setPassLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passForm.oldPassword,
          newPassword: passForm.newPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        setPassMsg({ text: 'Parol muvaffaqiyatli yangilandi!', ok: true })
        setPassForm({ oldPassword: '', newPassword: '', confirm: '' })
      } else {
        setPassMsg({ text: data.message, ok: false })
      }
    } catch {
      setPassMsg({ text: 'Server bilan bog\'lanib bo\'lmadi', ok: false })
    }
    setPassLoading(false)
  }

  if (!user) return null

  const getRatingTitle = (points) => {
    if (points >= 2000) return { title: 'Grandmaster', color: '#f59e0b', Icon: Crown }
    if (points >= 1500) return { title: 'Master', color: '#8b5cf6', Icon: Gem }
    if (points >= 1200) return { title: 'Expert', color: '#0ea5e9', Icon: Star }
    if (points >= 1000) return { title: 'Intermediate', color: '#22c55e', Icon: Sprout }
    return { title: 'Beginner', color: '#94a3b8', Icon: Shield }
  }

  const ratingInfo = rating ? getRatingTitle(rating.points) : null

  return (
    <div>
      <Navbar />
      <div className="profile-page">

        {/* Hero */}
        <div className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-big">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="profile-hero-name">{user.name}</h2>
              <p className="profile-hero-email">{user.email}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span className="profile-badge">
                  <GraduationCap size={12} /> O'quvchi
                </span>
                {ratingInfo && (
                  <span style={{
                    background: ratingInfo.color + '20',
                    color: ratingInfo.color,
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: `1px solid ${ratingInfo.color}40`
                  }}>
                    <ratingInfo.Icon size={12} /> {ratingInfo.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-hero-stats">
            <div className="profile-mini-stat">
              <span className="profile-mini-value">{enrolledCount}</span>
              <span className="profile-mini-label">Kurslar</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value">{certCount}</span>
              <span className="profile-mini-label">Sertifikat</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value" style={{ color: '#f59e0b' }}>
                {rating?.points || 1000}
              </span>
              <span className="profile-mini-label">Battle ball</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value" style={{ color: '#22c55e' }}>
                {rating?.wins || 0}W
              </span>
              <span className="profile-mini-label">{rating?.losses || 0}L</span>
            </div>
          </div>
        </div>

        {/* Tablar */}
        <div className="dash-tabs">
          {[
            { key: 'profile', label: 'Profil', Icon: User },
            { key: 'battle', label: 'Battle', Icon: Swords },
            { key: 'security', label: 'Xavfsizlik', Icon: Lock },
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

        {/* Profil tab */}
        {activeTab === 'profile' && (
          <div className="profile-card">
            <h3><User size={18} /> Ismni o'zgartirish</h3>
            {nameMsg && (
              <p className={`profile-msg ${nameMsg.ok ? 'msg-ok' : 'msg-err'}`}>
                {nameMsg.text}
              </p>
            )}
            <div className="form-group">
              <label>Yangi ism</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })}
                placeholder="Ism va familiya"
              />
            </div>
            <button className="btn-primary" onClick={handleNameUpdate} disabled={nameLoading}>
              <Save size={16} /> {nameLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        )}

        {/* Battle tab */}
        {activeTab === 'battle' && (
          <div>
            {rating ? (
              <>
                <div className="battle-profile-card">
                  <div className="battle-rating-header">
                    <div>
                      <h3><Swords size={18} /> Battle statistikasi</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Umumiy o'yin natijalari
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: ratingInfo?.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <ratingInfo.Icon size={28} /> {ratingInfo?.title}
                      </div>
                    </div>
                  </div>

                  <div className="battle-stats-grid">
                    <div className="battle-stat-item">
                      <div className="battle-stat-value" style={{ color: '#f59e0b' }}>
                        {rating.points}
                      </div>
                      <div className="battle-stat-label">Ball</div>
                    </div>
                    <div className="battle-stat-item">
                      <div className="battle-stat-value" style={{ color: '#22c55e' }}>
                        {rating.wins}
                      </div>
                      <div className="battle-stat-label">G'alaba</div>
                    </div>
                    <div className="battle-stat-item">
                      <div className="battle-stat-value" style={{ color: '#ef4444' }}>
                        {rating.losses}
                      </div>
                      <div className="battle-stat-label">Mag'lubiyat</div>
                    </div>
                    <div className="battle-stat-item">
                      <div className="battle-stat-value" style={{ color: '#0ea5e9' }}>
                        {rating.wins + rating.losses}
                      </div>
                      <div className="battle-stat-label">Jami o'yin</div>
                    </div>
                  </div>

                  {(rating.wins + rating.losses) > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>G'alaba foizi</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#22c55e' }}>
                          {Math.round((rating.wins / (rating.wins + rating.losses)) * 100)}%
                        </span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.round((rating.wins / (rating.wins + rating.losses)) * 100)}%`,
                          height: '10px',
                          background: 'linear-gradient(90deg, #22c55e, #0ea5e9)',
                          borderRadius: '10px',
                          transition: 'width 0.5s'
                        }}></div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>Keyingi darajaga</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: ratingInfo?.color }}>
                        {rating.points} / {
                          rating.points >= 2000 ? 'MAX' :
                          rating.points >= 1500 ? 2000 :
                          rating.points >= 1200 ? 1500 :
                          rating.points >= 1000 ? 1200 : 1000
                        }
                      </span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (rating.points / (
                          rating.points >= 2000 ? 2000 :
                          rating.points >= 1500 ? 2000 :
                          rating.points >= 1200 ? 1500 :
                          rating.points >= 1000 ? 1200 : 1000
                        )) * 100)}%`,
                        height: '10px',
                        background: `linear-gradient(90deg, ${ratingInfo?.color}, #a78bfa)`,
                        borderRadius: '10px',
                        transition: 'width 0.5s'
                      }}></div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => navigate('/battle')}
                >
                  <Swords size={16} /> Battle ga o'tish
                </button>
              </>
            ) : (
              <div className="profile-card" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{
                  width: '88px', height: '88px', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(14, 165, 233, 0.15))',
                  borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-light)'
                }}>
                  <Swords size={44} />
                </div>
                <h3>Hali battle o'ynamagansiz</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Battle o'ynab reyting to'plang!
                </p>
                <button className="btn-primary" onClick={() => navigate('/battle')}>
                  Birinchi battle boshlash <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Xavfsizlik tab */}
        {activeTab === 'security' && (
          <div className="profile-card">
            <h3><Lock size={18} /> Parolni o'zgartirish</h3>
            {passMsg && (
              <p className={`profile-msg ${passMsg.ok ? 'msg-ok' : 'msg-err'}`}>
                {passMsg.text}
              </p>
            )}
            <div className="form-group">
              <label>Eski parol</label>
              <input
                type="password"
                value={passForm.oldPassword}
                onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Yangi parol</label>
              <input
                type="password"
                value={passForm.newPassword}
                onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Yangi parolni tasdiqlang</label>
              <input
                type="password"
                value={passForm.confirm}
                onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button className="btn-primary" onClick={handlePassUpdate} disabled={passLoading}>
              <Save size={16} /> {passLoading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
            </button>

            <div className="danger-card" style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>
                <AlertTriangle size={18} /> Hisobdan chiqish
              </h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '14px', marginBottom: '16px' }}>
                Barcha qurilmalardan chiqish uchun tugmani bosing.
              </p>
              <button className="btn-danger" onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/')
              }}>
                <LogOut size={16} /> Chiqish
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile