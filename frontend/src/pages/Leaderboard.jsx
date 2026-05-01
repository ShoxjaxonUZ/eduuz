import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Crown, Medal, Award, Users, TrendingUp,
  BookOpen, Swords, Star, Flame, Target, Shield, Gem, Sprout
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import '../styles/leaderboard.css'

function Leaderboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    document.title = "Top o'quvchilar — EduUz"
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leaderboard')
      const data = await res.json()
      if (Array.isArray(data)) setPlayers(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const getRankInfo = (points) => {
    if (points >= 2000) return { title: 'Grandmaster', color: '#f59e0b', Icon: Crown }
    if (points >= 1500) return { title: 'Master', color: '#8b5cf6', Icon: Gem }
    if (points >= 1200) return { title: 'Expert', color: '#0ea5e9', Icon: Star }
    if (points >= 1000) return { title: 'Intermediate', color: '#22c55e', Icon: Sprout }
    return { title: 'Beginner', color: '#94a3b8', Icon: Shield }
  }

  const getMedal = (rank) => {
    if (rank === 1) return { Icon: Crown, color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }
    if (rank === 2) return { Icon: Medal, color: '#94a3b8', bg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }
    if (rank === 3) return { Icon: Award, color: '#f97316', bg: 'linear-gradient(135deg, #f97316, #fb923c)' }
    return null
  }

  const getAvatarColor = (name) => {
    const colors = ['#8b5cf6', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#10b981']
    const index = name?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  const filtered = players.filter(p => {
    if (tab === 'battle') return p.wins > 0 || p.losses > 0
    if (tab === 'learners') return p.completed_courses > 0
    return true
  }).sort((a, b) => {
    if (tab === 'learners') return b.completed_courses - a.completed_courses
    return b.points - a.points
  }).map((p, i) => ({ ...p, rank: i + 1 }))

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  const myRank = players.find(p => p.id === user?.id)

  if (loading) return (
    <div><Navbar /><Loading text="Reyting yuklanmoqda..." /></div>
  )

  return (
    <div>
      <Navbar />
      <div className="leaderboard-page">

        {/* Hero */}
        <div className="lb-hero">
          <div className="lb-hero-badge">
            <Trophy size={14} /> Top o'quvchilar
          </div>
          <h1>
            Eng faol <span className="gradient-text">o'quvchilar</span>
          </h1>
          <p>EduUz jamoasining eng yaxshi qatnashchilari va g'oliblar reytingi</p>
        </div>

        {/* Mening o'rnim */}
        {user && myRank && (
          <div className="lb-my-rank">
            <div className="my-rank-left">
              <div className="my-rank-number">#{myRank.rank || '—'}</div>
              <div>
                <div className="my-rank-label">Sizning o'rningiz</div>
                <div className="my-rank-name">{myRank.name}</div>
              </div>
            </div>
            <div className="my-rank-stats">
              <div className="my-stat-item">
                <Trophy size={16} color="#f59e0b" />
                <strong>{myRank.points}</strong> ball
              </div>
              <div className="my-stat-item">
                <BookOpen size={16} color="#0ea5e9" />
                <strong>{myRank.completed_courses}</strong> kurs
              </div>
              <div className="my-stat-item">
                <Swords size={16} color="#22c55e" />
                <strong>{myRank.wins}W</strong> / <strong>{myRank.losses}L</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tablar */}
        <div className="lb-tabs">
          {[
            { key: 'all', label: 'Umumiy', Icon: TrendingUp },
            { key: 'battle', label: 'Battle top', Icon: Swords },
            { key: 'learners', label: 'Ko\'p o\'qigan', Icon: BookOpen },
          ].map(t => (
            <button
              key={t.key}
              className={`lb-tab ${tab === t.key ? 'lb-tab-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* TOP 3 — Podium */}
        {top3.length > 0 && (
          <div className="lb-podium">
            {/* 2-o'rin */}
            {top3[1] && (
              <div className="podium-item podium-2">
                <div className="podium-crown"><Medal size={28} color="#94a3b8" /></div>
                <div className="podium-avatar" style={{ background: getAvatarColor(top3[1].name), borderColor: '#94a3b8' }}>
                  {top3[1].name[0].toUpperCase()}
                </div>
                <div className="podium-name">{top3[1].name}</div>
                <div className="podium-points" style={{ color: '#94a3b8' }}>{top3[1].points}</div>
                <div className="podium-rank-label">ball</div>
                <div className="podium-pillar" style={{ background: 'linear-gradient(180deg, #94a3b8, #64748b)' }}>
                  <div className="podium-num">2</div>
                </div>
              </div>
            )}

            {/* 1-o'rin */}
            {top3[0] && (
              <div className="podium-item podium-1">
                <div className="podium-crown podium-crown-big"><Crown size={40} color="#f59e0b" /></div>
                <div className="podium-avatar podium-avatar-1" style={{ background: getAvatarColor(top3[0].name), borderColor: '#f59e0b' }}>
                  {top3[0].name[0].toUpperCase()}
                </div>
                <div className="podium-name podium-name-1">{top3[0].name}</div>
                <div className="podium-points podium-points-1" style={{ color: '#f59e0b' }}>{top3[0].points}</div>
                <div className="podium-rank-label">ball</div>
                <div className="podium-pillar podium-pillar-1" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }}>
                  <div className="podium-num">1</div>
                </div>
              </div>
            )}

            {/* 3-o'rin */}
            {top3[2] && (
              <div className="podium-item podium-3">
                <div className="podium-crown"><Award size={28} color="#f97316" /></div>
                <div className="podium-avatar" style={{ background: getAvatarColor(top3[2].name), borderColor: '#f97316' }}>
                  {top3[2].name[0].toUpperCase()}
                </div>
                <div className="podium-name">{top3[2].name}</div>
                <div className="podium-points" style={{ color: '#f97316' }}>{top3[2].points}</div>
                <div className="podium-rank-label">ball</div>
                <div className="podium-pillar" style={{ background: 'linear-gradient(180deg, #f97316, #ea580c)' }}>
                  <div className="podium-num">3</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Qolgan ro'yxat */}
        {rest.length > 0 && (
          <div className="lb-table-wrap">
            <div className="lb-list-header">
              <Users size={18} /> Boshqa o'quvchilar
            </div>

            <div className="lb-table-scroll">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>O'quvchi</th>
                    <th>Daraja</th>
                    <th className="lb-th-center">Ball</th>
                    <th className="lb-th-center lb-hide-mobile">Kurslar</th>
                    <th className="lb-th-center lb-hide-mobile">G'alaba</th>
                    <th className="lb-th-center lb-hide-mobile">Mag'lubiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map(p => {
                    const rankInfo = getRankInfo(p.points)
                    const isMe = user?.id === p.id
                    return (
                      <tr key={p.id} className={isMe ? 'lb-tr-me' : ''}>
                        <td className="lb-td-rank">#{p.rank}</td>
                        <td>
                          <div className="lb-td-user">
                            <div className="lb-avatar" style={{ background: getAvatarColor(p.name) }}>
                              {p.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="lb-name">
                                {p.name}
                                {isMe && <span className="lb-you-badge">Siz</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="lb-title-chip" style={{ color: rankInfo.color, background: rankInfo.color + '15', borderColor: rankInfo.color + '30' }}>
                            <rankInfo.Icon size={12} /> {rankInfo.title}
                          </span>
                        </td>
                        <td className="lb-td-center">
                          <span className="lb-points-cell">
                            <Trophy size={13} color="#f59e0b" />
                            <strong>{p.points}</strong>
                          </span>
                        </td>
                        <td className="lb-td-center lb-hide-mobile">
                          <span className="lb-num-cell">
                            {p.completed_courses}
                          </span>
                        </td>
                        <td className="lb-td-center lb-hide-mobile">
                          <span className="lb-num-cell lb-num-green">
                            {p.wins}
                          </span>
                        </td>
                        <td className="lb-td-center lb-hide-mobile">
                          <span className="lb-num-cell lb-num-red">
                            {p.losses}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="lb-empty">
            <Users size={64} />
            <h3>Hozircha o'quvchilar yo'q</h3>
            <p>Birinchi bo'ling va reytingni boshlang!</p>
            <button className="btn-primary" onClick={() => navigate('/battle')}>
              <Swords size={16} /> Battle boshlash
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Leaderboard