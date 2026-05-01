import { useEffect } from 'react'
import { Shield, Lock, Database, Eye, FileText } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/pages.css'

function Privacy() {
  useEffect(() => {
    document.title = "Maxfiylik siyosati — EduUz"
  }, [])

  return (
    <div>
      <Navbar />
      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-badge">
            <Shield size={14} /> Maxfiylik siyosati
          </div>
          <h1>Sizning <span className="gradient-text">ma'lumotlaringiz</span> xavfsiz</h1>
          <p>So'nggi yangilangan: {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>

        <div className="page-section">
          <div className="privacy-content">

            <div className="privacy-section">
              <div className="privacy-icon">
                <Database size={24} />
              </div>
              <h3>1. Qanday ma'lumotlar yig'amiz?</h3>
              <p>EduUz platformasi quyidagi ma'lumotlarni to'playdi:</p>
              <ul>
                <li><strong>Shaxsiy ma'lumotlar:</strong> Ism, email manzil</li>
                <li><strong>O'quv ma'lumotlari:</strong> Kurs progressi, test natijalari</li>
                <li><strong>Battle ma'lumotlari:</strong> Yutuqlar, ballar, reyting</li>
                <li><strong>Texnik ma'lumotlar:</strong> IP manzil, brauzer turi, kirish vaqti</li>
              </ul>
            </div>

            <div className="privacy-section">
              <div className="privacy-icon">
                <Eye size={24} />
              </div>
              <h3>2. Ma'lumotlardan qanday foydalanamiz?</h3>
              <p>Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
              <ul>
                <li>Platforma ishlashini ta'minlash va yaxshilash</li>
                <li>O'quvchiga shaxsiylashtirilgan tajriba taqdim etish</li>
                <li>Sertifikat va Battle ballarini boshqarish</li>
                <li>Muhim yangiliklar haqida xabardor qilish</li>
                <li>Xavfsizlik va firibgarlikka qarshi kurash</li>
              </ul>
            </div>

            <div className="privacy-section">
              <div className="privacy-icon">
                <Lock size={24} />
              </div>
              <h3>3. Ma'lumotlar xavfsizligi</h3>
              <p>
                Sizning ma'lumotlaringiz yuqori darajada himoyalangan:
              </p>
              <ul>
                <li>Barcha parollar <strong>bcrypt</strong> bilan shifrlangan</li>
                <li>Ma'lumotlar bazasi himoyalangan serverda saqlanadi</li>
                <li>JWT tokenlar orqali avtorizatsiya</li>
                <li>HTTPS orqali xavfsiz aloqa (deploy qilinganda)</li>
              </ul>
            </div>

            <div className="privacy-section">
              <div className="privacy-icon">
                <FileText size={24} />
              </div>
              <h3>4. Huquqlaringiz</h3>
              <p>Sizda quyidagi huquqlar mavjud:</p>
              <ul>
                <li><strong>Kirish:</strong> O'z ma'lumotlaringizni ko'rish</li>
                <li><strong>O'zgartirish:</strong> Profil ma'lumotlarini yangilash</li>
                <li><strong>O'chirish:</strong> Akkauntingizni butunlay o'chirish</li>
                <li><strong>Shikoyat:</strong> info@eduuz.uz orqali murojaat qilish</li>
              </ul>
            </div>

            <div className="privacy-section">
              <div className="privacy-icon">
                <Shield size={24} />
              </div>
              <h3>5. Uchinchi tomonlar</h3>
              <p>
                Biz sizning ma'lumotlaringizni <strong>hech qachon sotmaymiz</strong> yoki
                reklama maqsadida uchinchi tomonlarga bermaymiz. Faqat qonuniy talabnoma
                bo'lgan holatda tegishli organlar bilan bo'lishishimiz mumkin.
              </p>
            </div>

            <div className="privacy-section">
              <div className="privacy-icon">
                <FileText size={24} />
              </div>
              <h3>6. Bog'lanish</h3>
              <p>
                Maxfiylik siyosatiga oid savollaringiz bo'lsa, biz bilan bog'laning:
              </p>
              <ul>
                <li>Email: <a href="mailto:info@eduuz.uz" style={{ color: 'var(--primary-light)' }}>info@eduuz.uz</a></li>
                <li>Telefon: <a href="tel:+998901234567" style={{ color: 'var(--primary-light)' }}>+998 90 123 45 67</a></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Privacy