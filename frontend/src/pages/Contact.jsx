import { useEffect, useState } from 'react'
import {
  Mail, Phone, MapPin, Send, MessageCircle,
  Clock, CheckCircle2
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/pages.css'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = "Aloqa — EduUz"
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      alert('Barcha maydonlarni to\'ldiring!')
      return
    }
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div>
      <Navbar />
      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-badge">
            <MessageCircle size={14} /> Aloqa
          </div>
          <h1>Biz bilan <span className="gradient-text">bog'laning</span></h1>
          <p>Savollaringiz, takliflaringiz yoki hamkorlik uchun yozing</p>
        </div>

        <div className="page-section">
          <div className="contact-grid">

            {/* Contact info */}
            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-info-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <a href="mailto:info@eduuz.uz" className="contact-info-value">info@eduuz.uz</a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <div className="contact-info-label">Telefon</div>
                  <a href="tel:+998901234567" className="contact-info-value">+998 90 123 45 67</a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="contact-info-label">Manzil</div>
                  <div className="contact-info-value">Toshkent, O'zbekiston</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div className="contact-info-label">Ish vaqti</div>
                  <div className="contact-info-value">Dushanba — Shanba<br />9:00 — 18:00</div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="contact-form">
              <h3>Xabar yuboring</h3>
              {sent && (
                <div className="contact-success">
                  <CheckCircle2 size={18} />
                  Xabaringiz yuborildi! Tez orada javob beramiz.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Ism</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ismingiz"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Xabar</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Xabaringizni yozing..."
                    rows={5}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <Send size={16} /> Yuborish
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Contact