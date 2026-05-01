import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Rocket, BookOpen, Award, Bot, Swords,
  Smartphone, ArrowRight, Play, GraduationCap, BarChart3,
  Star, Users, Clock, Target, UserPlus, PlayCircle,
  Trophy, CheckCircle2, ChevronDown, Shield, Zap,
  Quote, Globe, Code2, Lightbulb
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/home.css'

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({ users: 0, courses: 0, lessons: 0 })
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    document.title = "EduUz — O'zbek tilida bepul ta'lim"

    fetch('http://localhost:5000/api/teacher/all-courses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data.slice(0, 6))
          const totalStudents = data.reduce((acc, c) => acc + (c.students_count || 0), 0)
          const totalLessons = data.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)
          setStats({
            users: totalStudents || 150,
            courses: data.length,
            lessons: totalLessons
          })
        }
      })
      .catch(() => { })
  }, [])

  const features = [
    { Icon: GraduationCap, title: "O'zbek tilida", desc: "Barcha kurslar sof o'zbek tilida tayyorlangan", color: "#8b5cf6" },
    { Icon: Bot, title: "AI Test tizimi", desc: "Sun'iy intellekt yordamida shaxsiy testlar", color: "#0ea5e9" },
    { Icon: Swords, title: "Code Battle", desc: "Real vaqtda dasturchilar bilan musobaqa", color: "#22c55e" },
    { Icon: Award, title: "Sertifikat", desc: "Kursni tugatib rasmiy sertifikat oling", color: "#f59e0b" },
    { Icon: Zap, title: "Modular tizim", desc: "Har 5 darsdan keyin bilimni tekshirish", color: "#ec4899" },
    { Icon: Smartphone, title: "Barcha qurilma", desc: "Telefon, planshet va kompyuterda", color: "#06b6d4" },
    { Icon: Shield, title: "Xavfsiz", desc: "Ma'lumotlar shifrlangan va himoyalangan", color: "#10b981" },
    { Icon: Globe, title: "Istalgan vaqtda", desc: "24/7 onlayn, istalgan joydan", color: "#f97316" },
  ]

  const steps = [
    {
      num: "01",
      Icon: UserPlus,
      title: "Ro'yxatdan o'ting",
      desc: "Bepul akkaunt yarating — bir necha soniyada."
    },
    {
      num: "02",
      Icon: BookOpen,
      title: "Kursni tanlang",
      desc: "O'zingizga mos sohani tanlang va darslarni ko'rishni boshlang."
    },
    {
      num: "03",
      Icon: Trophy,
      title: "Sertifikat oling",
      desc: "Testlardan o'ting va rasmiy sertifikatingizni yuklab oling."
    }
  ]

  const testimonials = [
    {
      name: "Alijon Karimov",
      role: "Junior Frontend Developer",
      text: "EduUz da Python va JavaScript kurslarini o'rganib, bugun ish topdim. Darslar juda tushunarli va praktik. Ajoyib platforma!",
      avatar: "A",
      color: "#8b5cf6"
    },
    {
      name: "Malika Rahimova",
      role: "Student",
      text: "Code Battle tizimi eng zo'r qism! Boshqa dasturchilar bilan real vaqtda kod yozish juda qiziqarli va foydali.",
      avatar: "M",
      color: "#ec4899"
    },
    {
      name: "Bekzod Aliyev",
      role: "O'qituvchi",
      text: "AI test juda samarali ishlaydi. O'quvchilarim bilimini har 5 darsdan keyin avtomatik tekshirish — ajoyib imkoniyat.",
      avatar: "B",
      color: "#0ea5e9"
    }
  ]

  const faqs = [
    {
      q: "EduUz haqiqatan ham bepulmi?",
      a: "Ha, barcha kurslar to'liq bepul. Hech qanday yashirin to'lov yo'q. Siz istalgan vaqtda istalgan kursni o'rganishingiz mumkin."
    },
    {
      q: "Sertifikat qanday olaman?",
      a: "Kursni tugatib, barcha AI testlardan muvaffaqiyatli o'tsangiz, sertifikat avtomatik tayyor bo'ladi. Uni PDF formatida yuklab olishingiz mumkin."
    },
    {
      q: "Code Battle nima?",
      a: "Bu dasturchilar uchun real vaqtda musobaqa tizimi. Boshqa o'quvchilar bilan 5 daqiqada masala yechib, ball to'plang va reytingda ko'tariling."
    },
    {
      q: "AI Test qanday ishlaydi?",
      a: "Sun'iy intellekt har bir kurs uchun shaxsiy testlar yaratadi. Har 5 darsdan keyin bilimingizni tekshiradi va kamchiliklaringizni aniqlaydi."
    },
    {
      q: "Mobil qurilmada ishlaydimi?",
      a: "Albatta! EduUz butunlay moslashuvchan — telefon, planshet va kompyuterda bir xil qulaylikda ishlaydi."
    }
  ]

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="hero-new">
        <div className="hero-bg-glow"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} /> O'zbekistonning zamonaviy ta'lim platformasi
            </div>
            <h1 className="hero-title">
              Kelajak kasblarini
              <br />
              <span className="gradient-text">o'zbek tilida</span> o'rganing
            </h1>
            <p className="hero-subtitle">
              Dasturlash, matematika va zamonaviy kasblar bo'yicha bepul kurslar.
              AI yordami, Code Battle va rasmiy sertifikatlar bilan.
            </p>

            <div className="hero-actions">
              <button className="btn-primary btn-hero" onClick={() => navigate(user ? '/courses' : '/register')}>
                {user ? (
                  <><BookOpen size={18} /> Kurslarga o'tish</>
                ) : (
                  <><Rocket size={18} /> Bepul boshlash</>
                )}
              </button>
              <button className="btn-outline btn-hero" onClick={() => navigate('/courses')}>
                <PlayCircle size={18} /> Kurslarni ko'rish
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                {['#8b5cf6', '#ec4899', '#0ea5e9', '#22c55e'].map((c, i) => (
                  <div key={i} className="trust-avatar" style={{ background: c }}>
                    {['A', 'M', 'B', 'D'][i]}
                  </div>
                ))}
              </div>
              <div className="trust-text">
                <div className="trust-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span><strong>{stats.users}+</strong> o'quvchi bizni tanlagan</span>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="hero-illustration">
            <div className="illustration-wrap">
              {/* Asosiy rasm/kartochka */}
              <div className="illu-main-card">
                <div className="illu-header">
                  <div className="illu-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="illu-tab">main.js</div>
                </div>
                <div className="illu-code">
                  <div className="code-line"><span className="c-purple">const</span> <span className="c-blue">student</span> = {`{`}</div>
                  <div className="code-line">  <span className="c-green">name</span>: <span className="c-yellow">'EduUz'</span>,</div>
                  <div className="code-line">  <span className="c-green">goal</span>: <span className="c-yellow">'bilim'</span>,</div>
                  <div className="code-line">  <span className="c-green">level</span>: <span className="c-pink">100</span></div>
                  <div className="code-line">{`}`};</div>
                  <div className="code-line code-comment">// O'rganishni boshlaylik</div>
                </div>
              </div>

              {/* Floating kartochkalar */}
              <div className="illu-float-1">
                <div className="float-icon" style={{ background: '#8b5cf6' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="float-title">{stats.courses}+ kurs</div>
                  <div className="float-sub">Barcha sohalar</div>
                </div>
              </div>

              <div className="illu-float-2">
                <div className="float-icon" style={{ background: '#22c55e' }}>
                  <Trophy size={20} />
                </div>
                <div>
                  <div className="float-title">{stats.users}+ o'quvchi</div>
                  <div className="float-sub">Faol talabalar</div>
                </div>
              </div>

              <div className="illu-float-3">
                <div className="float-icon" style={{ background: '#f59e0b' }}>
                  <Award size={20} />
                </div>
                <div>
                  <div className="float-title">Sertifikat</div>
                  <div className="float-sub">Rasmiy hujjat</div>
                </div>
              </div>

              {/* Dekorativ shakllar */}
              <div className="illu-shape illu-shape-1"></div>
              <div className="illu-shape illu-shape-2"></div>
              <div className="illu-shape illu-shape-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* MASHHUR KURSLAR */}
      {courses.length > 0 && (
        <section className="home-section">
          <div className="home-container">
            <div className="section-header">
              <div className="section-badge">
                <BookOpen size={14} /> Kurslar
              </div>
              <h2>Mashhur kurslar</h2>
              <p>Eng ko'p o'qilgan va sevilgan kurslar bilan tanishing</p>
            </div>

            <div className="home-course-grid">
              {courses.map(kurs => (
                <div key={kurs.id} className="home-course-card" onClick={() => navigate(`/courses/${kurs.id}`)}>
                  <div className="home-course-thumb">
                    {kurs.image ? (
                      <img src={kurs.image} alt={kurs.title} />
                    ) : (
                      <div className="home-course-empty">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="home-course-badge">
                      <Sparkles size={10} /> Bepul
                    </div>
                  </div>
                  <div className="home-course-body">
                    <div className="home-course-tags">
                      <span className="home-tag">{kurs.category}</span>
                      <span className="home-tag">
                        <BarChart3 size={10} /> {kurs.daraja}
                      </span>
                    </div>
                    <h3>{kurs.title}</h3>
                    <p>{(kurs.desc || kurs.description || '').substring(0, 80)}...</p>
                    <div className="home-course-meta">
                      <span><BookOpen size={12} /> {kurs.lessons?.length || 0} dars</span>
                      <span><Users size={12} /> {kurs.students_count || 0}</span>
                      <span className="home-course-rating">
                        <Star size={12} fill="currentColor" /> 4.8
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-cta">
              <button className="btn-outline" onClick={() => navigate('/courses')}>
                Barcha kurslarni ko'rish <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* NIMA UCHUN EDUUZ */}
      <section className="home-section features-section">
        <div className="home-container">
          <div className="section-header">
            <div className="section-badge">
              <Lightbulb size={14} /> Xususiyatlar
            </div>
            <h2>Nima uchun EduUz?</h2>
            <p>Zamonaviy ta'limning barcha imkoniyatlari bir joyda</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{
                  background: f.color + '20',
                  color: f.color
                }}>
                  <f.Icon size={24} />
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QANDAY ISHLAYDI */}
      <section className="home-section steps-section">
        <div className="home-container">
          <div className="section-header">
            <div className="section-badge">
              <Target size={14} /> 3 bosqich
            </div>
            <h2>Qanday ishlaydi?</h2>
            <p>Uch oddiy qadamda o'rganishni boshlang</p>
          </div>

          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">
                  <s.Icon size={32} />
                </div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow"><ArrowRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-section testimonials-section">
        <div className="home-container">
          <div className="section-header">
            <div className="section-badge">
              <Quote size={14} /> Fikrlar
            </div>
            <h2>O'quvchilar nima deyishadi?</h2>
            <p>Minglab baxtli o'quvchilarning ta'surotlari</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-quote"><Quote size={32} /></div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="home-section faq-section">
        <div className="home-container">
          <div className="section-header">
            <div className="section-badge">
              <Lightbulb size={14} /> FAQ
            </div>
            <h2>Tez-tez so'raladigan savollar</h2>
            <p>Sizni qiziqtirgan savollarga javoblar</p>
          </div>

          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <ChevronDown size={20} className="faq-chevron" />
                </button>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="home-container">
            <div className="cta-box-new">
              <div className="cta-content">
                <div className="cta-badge">
                  <Rocket size={14} /> Bugundan boshlang
                </div>
                <h2>
                  Bepul ta'lim <span className="gradient-text">hozir boshlanadi</span>
                </h2>
                <p>
                  Ro'yxatdan o'ting va {stats.courses}+ kurslarga ega bo'ling.
                  Hech qanday to'lov yo'q. Faqat bilim.
                </p>
                <div className="cta-actions">
                  <button className="btn-primary btn-hero" onClick={() => navigate('/register')}>
                    <UserPlus size={18} /> Ro'yxatdan o'tish
                  </button>
                  <button className="btn-outline btn-hero" onClick={() => navigate('/login')}>
                    Kirish
                  </button>
                </div>
                <div className="cta-features">
                  <span><CheckCircle2 size={14} color="#22c55e" /> Bepul</span>
                  <span><CheckCircle2 size={14} color="#22c55e" /> Sertifikat</span>
                  <span><CheckCircle2 size={14} color="#22c55e" /> AI yordam</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default Home