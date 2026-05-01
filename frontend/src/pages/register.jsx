import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, UserPlus, GraduationCap,
  AlertCircle, ArrowRight, CheckCircle2
} from 'lucide-react'
import '../styles/auth.css'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.title = "Ro'yxatdan o'tish — EduUz"
  }, [])

  const passwordStrength = () => {
    const pw = form.password
    if (!pw) return { level: 0, text: '', color: '' }
    if (pw.length < 6) return { level: 1, text: 'Juda kuchsiz', color: '#ef4444' }
    if (pw.length < 8) return { level: 2, text: 'Kuchsiz', color: '#f59e0b' }
    if (pw.length < 12) return { level: 3, text: 'Yaxshi', color: '#22c55e' }
    return { level: 4, text: 'Juda kuchli', color: '#16a34a' }
  }

  const strength = passwordStrength()

  const handleRegister = async () => {
    setError('')
    if (!form.name || !form.email || !form.password) {
      return setError('Barcha maydonlarni to\'ldiring')
    }
    if (form.password.length < 6) {
      return setError('Parol kamida 6 ta belgi bo\'lishi kerak')
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/onboarding')
      } else {
        setError(data.message || 'Ro\'yxatdan o\'tishda xatolik')
      }
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={28} />
          </div>
          <div className="auth-logo-text">EduUz</div>
        </div>

        <h1 className="auth-title">Ro'yxatdan o'tish</h1>
        <p className="auth-sub">Bepul akkaunt yarating va o'rganishni boshlang</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="form-group">
          <label>Ism</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ism va familiya"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Parol</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Kamida 6 ta belgi"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.password && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{
                      background: i <= strength.level ? strength.color : 'var(--border)'
                    }}
                  ></div>
                ))}
              </div>
              <span style={{ color: strength.color }}>{strength.text}</span>
            </div>
          )}
        </div>

        <button
          className="btn-primary full auth-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <>Yaratilmoqda...</>
          ) : (
            <><UserPlus size={18} /> Ro'yxatdan o'tish</>
          )}
        </button>

        <div className="auth-benefits">
          <div className="benefit-item">
            <CheckCircle2 size={14} color="#22c55e" /> Bepul
          </div>
          <div className="benefit-item">
            <CheckCircle2 size={14} color="#22c55e" /> Sertifikat
          </div>
          <div className="benefit-item">
            <CheckCircle2 size={14} color="#22c55e" /> AI yordam
          </div>
        </div>

        <div className="auth-divider">
          <span>yoki</span>
        </div>

        <div className="auth-link">
          Hisobingiz bormi?{' '}
          <Link to="/login">
            Kirish <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register