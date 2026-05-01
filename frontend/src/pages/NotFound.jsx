import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, ArrowLeft, Search, BookOpen, Ghost,
  AlertCircle, Compass
} from 'lucide-react'
import Navbar from '../components/Navbar'
import '../styles/notfound.css'

function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "404 — Sahifa topilmadi — EduUz"
  }, [])

  const quickLinks = [
    { Icon: Home, label: 'Bosh sahifa', path: '/' },
    { Icon: BookOpen, label: 'Kurslar', path: '/courses' },
    { Icon: Compass, label: 'Yordam', path: '/help' },
  ]

  return (
    <div>
      <Navbar />
      <div className="notfound-page">
        <div className="notfound-bg-glow"></div>

        <div className="notfound-container">
          {/* 404 katta raqam */}
          <div className="notfound-number">
            <span className="num-4">4</span>
            <div className="num-ghost">
              <Ghost size={100} />
            </div>
            <span className="num-4">4</span>
          </div>

          {/* Xabar */}
          <div className="notfound-message">
            <div className="notfound-badge">
              <AlertCircle size={14} /> Sahifa topilmadi
            </div>
            <h1>Oops! Yo'lni yo'qotdingizmi?</h1>
            <p>
              Qidirayotgan sahifa mavjud emas, ko'chirilgan yoki o'chirilgan.
              Keling birgalikda to'g'ri yo'lni topamiz!
            </p>
          </div>

          {/* Tugmalar */}
          <div className="notfound-actions">
            <button className="btn-primary btn-hero" onClick={() => navigate('/')}>
              <Home size={18} /> Bosh sahifaga qaytish
            </button>
            <button className="btn-outline btn-hero" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Orqaga
            </button>
          </div>

          {/* Tezkor havolalar */}
          <div className="notfound-quick">
            <div className="quick-title">Yoki quyidagi sahifalarga o'ting:</div>
            <div className="quick-links">
              {quickLinks.map((link, i) => (
                <button
                  key={i}
                  className="quick-link"
                  onClick={() => navigate(link.path)}
                >
                  <div className="quick-icon">
                    <link.Icon size={20} />
                  </div>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Floating shapes */}
          <div className="nf-shape nf-shape-1"></div>
          <div className="nf-shape nf-shape-2"></div>
          <div className="nf-shape nf-shape-3"></div>
        </div>
      </div>
    </div>
  )
}

export default NotFound