import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Send, Mail, MapPin, Phone, Heart,
  MessageCircle, Camera, Play
} from 'lucide-react'
import '../styles/footer.css'

function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <div className="footer-logo-icon">
              <GraduationCap size={20} />
            </div>
            <span className="footer-logo">EduUz</span>
          </div>
          <p className="footer-desc">
            O'zbek tilida bepul ta'lim platformasi. Dasturlash, matematika, til o'rganish va boshqa ko'plab kurslar.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-btn" title="Telegram">
              <Send size={16} />
            </a>
            <a href="#" className="social-btn" title="Instagram">
              <Camera size={16} />
            </a>
            <a href="#" className="social-btn" title="Chat">
              <MessageCircle size={16} />
            </a>
            <a href="#" className="social-btn" title="YouTube">
              <Play size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <div className="footer-col">
            <h4>Platforma</h4>
            <ul>
              <li onClick={() => navigate('/courses')}>Barcha kurslar</li>
              <li onClick={() => navigate('/battle')}>Code Battle</li>
              <li onClick={() => navigate('/ai-quiz')}>AI Test</li>
              <li onClick={() => navigate('/dashboard')}>Dashboard</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Kompaniya</h4>
            <ul>
              <li onClick={() => navigate('/about')}>Biz haqimizda</li>
              <li onClick={() => navigate('/contact')}>Aloqa</li>
              <li onClick={() => navigate('/help')}>Yordam</li>
              <li onClick={() => navigate('/privacy')}>Maxfiylik</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Bog'lanish</h4>
            <ul className="footer-contact">
              <li>
                <Mail size={14} />
                <a href="mailto:info@eduuz.uz">info@eduuz.uz</a>
              </li>
              <li>
                <Phone size={14} />
                <a href="tel:+998901234567">+998 90 123 45 67</a>
              </li>
              <li>
                <MapPin size={14} />
                <span>Toshkent, O'zbekiston</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {year} EduUz. Barcha huquqlar himoyalangan.</span>
          <span>Made with by EduUz Team</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer