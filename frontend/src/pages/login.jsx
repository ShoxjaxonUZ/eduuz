import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail, Lock, Eye, EyeOff, LogIn, GraduationCap,
  AlertCircle, ArrowRight
} from 'lucide-react'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.title = "Kirish — EduUz"
  }, [])

  const handleLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      return setError('Barcha maydonlarni to\'ldiring')
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  // Onboarding o'tilganmi tekshirish
  try {
    const statusRes = await fetch('http://localhost:5000/api/onboarding/status', {
      headers: { Authorization: `Bearer ${data.token}` }
    })
    const statusData = await statusRes.json()
    if (statusData.onboarded) {
      navigate('/')
    } else {
      navigate('/onboarding')
    }
  } catch {
    navigate('/')
  }
} else {
  setError(data.message || 'Kirish amalga oshmadi')
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

        <h1 className="auth-title">Xush kelibsiz</h1>
        <p className="auth-sub">Hisobingizga kirib, o'rganishni davom eting</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          className="btn-primary full auth-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>Yuklanmoqda...</>
          ) : (
            <><LogIn size={18} /> Kirish</>
          )}
        </button>

        <div className="auth-divider">
          <span>yoki</span>
        </div>

        <div className="auth-link">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register">
            Ro'yxatdan o'tish <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login