import { useEffect, useState } from 'react'
import {
  HelpCircle, ChevronDown, BookOpen, User,
  Award, Bot, Swords, Settings, MessageCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/pages.css'

function Help() {
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    document.title = "Yordam — EduUz"
  }, [])

  const categories = [
    { Icon: User, title: "Akkaunt", count: 5 },
    { Icon: BookOpen, title: "Kurslar", count: 8 },
    { Icon: Award, title: "Sertifikat", count: 4 },
    { Icon: Bot, title: "AI Test", count: 3 },
    { Icon: Swords, title: "Battle", count: 6 },
    { Icon: Settings, title: "Sozlamalar", count: 4 },
  ]

  const faqs = [
    {
      q: "Qanday ro'yxatdan o'taman?",
      a: "Bosh sahifadan 'Ro'yxatdan o'tish' tugmasini bosing, ism, email va parol kiriting. Keyin shu ma'lumotlar bilan kirishingiz mumkin."
    },
    {
      q: "Parolni unutsam nima qilaman?",
      a: "Hozircha parolni tiklash funksiyasi mavjud emas. Admin bilan bog'laning: info@eduuz.uz"
    },
    {
      q: "Kursga qanday yoziaman?",
      a: "Kurslar sahifasidan kerakli kursni tanlang va 'Kursni boshlash' tugmasini bosing. Bepul va avtomatik yoziladi."
    },
    {
      q: "Sertifikat qanday olaman?",
      a: "Kursdagi barcha darslarni tugating va AI testdan o'ting. Keyin 'Sertifikat olish' tugmasi aktiv bo'ladi."
    },
    {
      q: "Sertifikat PDF saqlashning xatoligi",
      a: "PDF yuklab olishda muammo bo'lsa, brauzerni yangilang yoki boshqa brauzer ishlatib ko'ring (Chrome tavsiya etiladi)."
    },
    {
      q: "AI test qanday ishlaydi?",
      a: "Sun'iy intellekt har bir kurs uchun 5 ta savol yaratadi. 80% to'g'ri javob bersangiz, testdan o'tasiz. Aks holda 24 soat kutasiz."
    },
    {
      q: "Code Battle — bu nima?",
      a: "Real vaqtda ikki dasturchi 5 daqiqada bitta masalani yechadi. Yutgan ball oladi, yutqazgan ball yo'qotadi."
    },
    {
      q: "Battle da raqib topish uchun nima qilaman?",
      a: "Battle sahifasidan 'Tezkor match' tugmasini bosing yoki 'Xona yaratish' orqali do'stingizga ID yuboring."
    },
    {
      q: "Profilimni qanday o'zgartiraman?",
      a: "Yuqori o'ng burchakdagi avatarni bosing → 'Profil' → keyin istagan ma'lumotni o'zgartirishingiz mumkin."
    },
    {
      q: "Dark/Light rejimni qanday almashtirish?",
      a: "Navbardagi quyosh/oy icon tugmasini bosing. Sozlamalaringiz avtomatik saqlanadi."
    }
  ]

  return (
    <div>
      <Navbar />
      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-badge">
            <HelpCircle size={14} /> Yordam markazi
          </div>
          <h1>Sizga <span className="gradient-text">qanday yordam</span> beramiz?</h1>
          <p>Savollaringizga tez va aniq javoblar</p>
        </div>

        {/* Kategoriyalar */}
        <div className="page-section">
          <div className="help-categories">
            {categories.map((cat, i) => (
              <div key={i} className="help-cat-card">
                <div className="help-cat-icon">
                  <cat.Icon size={24} />
                </div>
                <h4>{cat.title}</h4>
                <p>{cat.count} ta maqola</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="page-section">
          <div className="section-header-page">
            <h2>Tez-tez so'raladigan savollar</h2>
            <p>Ko'p uchraydigan savollarga javoblar</p>
          </div>

          <div className="faq-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
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

        {/* Help CTA */}
        <div className="page-cta">
          <MessageCircle size={48} color="#8b5cf6" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2>Javob topa olmadingizmi?</h2>
          <p>Biz bilan bog'laning, yordam beramiz</p>
          <a href="mailto:info@eduuz.uz" className="btn-primary btn-hero" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Mail size={16} /> Email yozish
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Mail icon import qo'shish kerak
import { Mail } from 'lucide-react'

export default Help