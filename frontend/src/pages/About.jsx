import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Target, Heart, Rocket, Users,
  Award, Globe, Sparkles, ArrowRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/pages.css'

function About() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Biz haqimizda — EduUz"
  }, [])

  const values = [
    { Icon: Target, title: 'Sifatli ta\'lim', desc: 'Har bir kurs professional o\'qituvchilar tomonidan tayyorlangan' },
    { Icon: Heart, title: 'Bepul', desc: 'Hamma uchun teng ta\'lim imkoniyati — to\'lov yo\'q' },
    { Icon: Globe, title: 'Istalgan joyda', desc: '24/7 onlayn, istalgan qurilmada o\'qish mumkin' },
    { Icon: Rocket, title: 'Innovatsiya', desc: 'AI, Battle va zamonaviy texnologiyalar' },
  ]

  return (
    <div>
      <Navbar />
      <div className="page-wrap">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-badge">
            <GraduationCap size={14} /> Biz haqimizda
          </div>
          <h1>O'zbek tilida <span className="gradient-text">sifatli ta'lim</span> uchun</h1>
          <p>
            EduUz — bu O'zbekistondagi zamonaviy ta'lim platformasi bo'lib,
            minglab o'quvchilarni bepul sifatli bilim bilan ta'minlaydi.
          </p>
        </div>

        {/* Mission */}
        <div className="page-section">
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Sparkles size={28} />
              </div>
              <h3>Bizning maqsadimiz</h3>
              <p>
                Har bir o'zbekistonlik uchun sifatli ta'limni bepul va oson yetkazib
                berish. Texnologiya, dasturlash va zamonaviy kasblarni har kim o'rgana oladi.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
                <Heart size={28} />
              </div>
              <h3>Bizning qadriyatlar</h3>
              <p>
                Ochiq, sifatli va erkin ta'lim. Sun'iy intellekt yordamida har bir
                o'quvchining shaxsiy ehtiyojlariga mos darslar va testlar.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                <Rocket size={28} />
              </div>
              <h3>Bizning kelajak</h3>
              <p>
                O'zbekistonda texnologiya sohasida mutaxassislar tayyorlash,
                ta'limni raqamlashtirish va dunyo darajasidagi darslar yaratish.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="page-section">
          <div className="section-header-page">
            <h2>Nima uchun bizni tanlashadi</h2>
            <p>EduUz ni boshqa platformalardan ajratib turuvchi sabablar</p>
          </div>

          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">
                  <v.Icon size={24} />
                </div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="page-section stats-section">
          <div className="stats-box">
            <div className="stats-item">
              <Users size={32} color="#8b5cf6" />
              <div className="stats-value">1000+</div>
              <div className="stats-label">Faol o'quvchilar</div>
            </div>
            <div className="stats-item">
              <Award size={32} color="#f59e0b" />
              <div className="stats-value">500+</div>
              <div className="stats-label">Berilgan sertifikatlar</div>
            </div>
            <div className="stats-item">
              <GraduationCap size={32} color="#22c55e" />
              <div className="stats-value">50+</div>
              <div className="stats-label">Sifatli kurslar</div>
            </div>
            <div className="stats-item">
              <Globe size={32} color="#0ea5e9" />
              <div className="stats-value">24/7</div>
              <div className="stats-label">Istalgan vaqtda</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="page-cta">
          <h2>Bizning jamoamizga qo'shiling</h2>
          <p>Hozir ro'yxatdan o'tib, bepul ta'lim sayohatingizni boshlang</p>
          <button className="btn-primary btn-hero" onClick={() => navigate('/register')}>
            Ro'yxatdan o'tish <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About