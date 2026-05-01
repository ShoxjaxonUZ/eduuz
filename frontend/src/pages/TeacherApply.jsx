import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/teacher.css'

function TeacherApply() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [status, setStatus] = useState('none')
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ full_name: user?.name || '', subject: '', experience: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "O'qituvchi bo'lish — EduUz"

    fetch('http://localhost:5000/api/teacher/my-status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setStatus(data.status)
        setRole(data.role)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async () => {
    if (!form.full_name || !form.subject || !form.experience) {
      return setError('Barcha maydonlarni to\'ldiring')
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/teacher/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setMsg(data.message)
        setStatus('pending')
      } else {
        setError(data.message)
      }
    } catch {
      setError('Xatolik yuz berdi')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="teacher-page">

        {role === 'teacher' ? (
          <div className="teacher-card">
            <div className="teacher-icon">🎓</div>
            <h2>Siz o'qituvchisiz!</h2>
            <p>O'z kurslaringizni yarating va boshqaring</p>
            <button className="btn-primary" onClick={() => navigate('/teacher/dashboard')}>
              O'qituvchi paneli
            </button>
          </div>
        ) : status === 'pending' ? (
          <div className="teacher-card">
            <div className="teacher-icon">⏳</div>
            <h2>Ariza ko'rib chiqilmoqda</h2>
            <p>Admin arizangizni ko'rib chiqmoqda. Tez orada javob olasiz!</p>
            <button className="btn-outline" onClick={() => navigate('/')}>
              Bosh sahifaga qaytish
            </button>
          </div>
        ) : status === 'rejected' ? (
          <div className="teacher-card">
            <div className="teacher-icon">❌</div>
            <h2>Ariza rad etildi</h2>
            <p>Afsuski arizangiz rad etildi. Qayta ariza yuborishingiz mumkin.</p>
            <button className="btn-primary" onClick={() => setStatus('none')}>
              Qayta ariza yuborish
            </button>
          </div>
        ) : (
          <div className="teacher-form-card">
            <div className="teacher-header">
              <div className="teacher-icon">🎓</div>
              <h2>O'qituvchi bo'lish</h2>
              <p>Arizangizni to'ldiring va admin tasdiqlashini kuting</p>
            </div>

            {msg && <p className="teacher-success">{msg}</p>}
            {error && <p className="teacher-error">{error}</p>}

            <div className="form-group">
              <label>Ism va familiya</label>
              <input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="To'liq ismingiz"
              />
            </div>

            <div className="form-group">
              <label>Fan / Yo'nalish</label>
              <input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Masalan: Python dasturlash, Matematika..."
              />
            </div>

            <div className="form-group">
              <label>Tajriba va qisqacha ma'lumot</label>
              <textarea
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                placeholder="O'zingiz haqingizda, tajribangiz va nima o'qita olishingiz haqida yozing..."
                rows={5}
                style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div className="teacher-benefits">
              <h4>O'qituvchi bo'lsangiz:</h4>
              <ul>
                <li>✅ O'z kurslaringizni yarata olasiz</li>
                <li>✅ Video darslar qo'sha olasiz</li>
                <li>✅ O'z o'quvchilaringizni ko'ra olasiz</li>
                <li>✅ Statistikani kuzata olasiz</li>
              </ul>
            </div>

            <button className="btn-primary full" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Yuborilmoqda...' : '📨 Ariza yuborish'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherApply