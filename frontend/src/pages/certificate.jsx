import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Award, Download, ArrowLeft, CheckCircle2, Trophy,
  Calendar, BookOpen
} from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import '../styles/certificate.css'

function Certificate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Sertifikat — EduUz"

    const loadCourse = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/teacher/all-courses')
        const data = await res.json()
        if (Array.isArray(data)) {
          const found = data.find(c => String(c.id) === String(id))
          if (found) setCourse(found)
        }
      } catch (err) { console.error(err) }

      const quizKey = `quiz_${user.id}_${id}`
      const quizState = localStorage.getItem(quizKey)
      if (quizState) {
        const state = JSON.parse(quizState)
        setPassed(state?.passed || false)
      }

      const hasModulePass = Object.keys(localStorage).some(key => {
        if (key.startsWith(`module_test_${id}_`) && key.endsWith(`_${user.id}`)) {
          try {
            const val = JSON.parse(localStorage.getItem(key))
            return val?.passed
          } catch { return false }
        }
        return false
      })
      if (hasModulePass) setPassed(true)

      setLoading(false)
    }

    loadCourse()
  }, [id])

  const handlePrint = async () => {
  const cert = document.querySelector('.cert')
  if (!cert) return

  try {
    // CSS loading kutish
    await new Promise(resolve => setTimeout(resolve, 200))

    const canvas = await html2canvas(cert, {
      scale: 4,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: cert.scrollWidth,
      windowHeight: cert.scrollHeight,
      onclone: (clonedDoc) => {
        // Gradient matnlarni qattiq rangga aylantirish PDF uchun
        const clonedCert = clonedDoc.querySelector('.cert')
        if (clonedCert) {
          // cert-big-title
          const title = clonedCert.querySelector('.cert-big-title')
          if (title) {
            title.style.background = 'none'
            title.style.webkitTextFillColor = '#1e1b4b'
            title.style.color = '#1e1b4b'
          }

          // cert-brand-name
          const brand = clonedCert.querySelector('.cert-brand-name')
          if (brand) {
            brand.style.background = 'none'
            brand.style.webkitTextFillColor = '#fbbf24'
            brand.style.color = '#fbbf24'
          }

          // cert-kicker
          const kicker = clonedCert.querySelector('.cert-kicker')
          if (kicker) {
            kicker.style.color = '#8b5cf6'
          }

          // cert-achievement strong
          const strong = clonedCert.querySelector('.cert-achievement strong')
          if (strong) {
            strong.style.color = '#7c3aed'
          }

          // watermark yashirish
          const wm = clonedCert.querySelector('.cert-watermark')
          if (wm) wm.style.display = 'none'
        }
      }
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // To'liq sahifani qoplash
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
    pdf.save(`Sertifikat-${user.name}-${course.title}.pdf`)
  } catch (err) {
    console.error('PDF xatolik:', err)
    alert('PDF saqlashda xatolik: ' + err.message)
  }
}

  const certId = 'EDU-' + (String(user?.id || '0') + String(id || '0'))
    .split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0)
    .toString(36).toUpperCase().padStart(6, '0')

  const today = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  if (loading) return (
    <div><Navbar /><Loading text="Yuklanmoqda..." /></div>
  )

  if (!course) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <h2>Kurs topilmadi</h2>
        <button className="btn-primary" onClick={() => navigate('/courses')}>
          <ArrowLeft size={16} /> Kurslarga qaytish
        </button>
      </div>
    </div>
  )

  if (!passed) return (
    <div>
      <Navbar />
      <div className="cert-locked">
        <div className="cert-locked-icon">
          <Trophy size={80} />
        </div>
        <h2>Sertifikat hali tayyor emas</h2>
        <p>Avval kurs testidan muvaffaqiyatli o'ting</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => navigate(`/courses/${id}`)}>
            <ArrowLeft size={16} /> Kursga qaytish
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cert-wrapper">
      <div className="no-print">
        <Navbar />
      </div>

      <div className="cert-container">
        {/* Tugmalar */}
        <div className="cert-actions no-print">
          <button className="btn-outline" onClick={() => navigate(`/courses/${id}`)}>
            <ArrowLeft size={16} /> Orqaga
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Download size={16} /> PDF yuklab olish
          </button>
        </div>

        {/* SERTIFIKAT */}
        <div className="cert">
          {/* Chap panel */}
          <div className="cert-left">
            <div className="cert-left-content">
              <div className="cert-seal">
                <Award size={48} />
              </div>
              <div className="cert-brand-name">EduUz</div>
              <div className="cert-brand-line"></div>
              <div className="cert-brand-text">
                O'zbek tilida<br />bepul ta'lim<br />platformasi
              </div>
            </div>
            <div className="cert-left-shape"></div>
          </div>

          {/* O'ng panel */}
          <div className="cert-right">
            <div className="cert-header">
              <div className="cert-kicker">CERTIFICATE OF ACHIEVEMENT</div>
              <h1 className="cert-big-title">CERTIFICATE</h1>
            </div>

            <div className="cert-body">
              <p className="cert-presented">Ushbu sertifikat quyidagi shaxsga berildi</p>

              <h2 className="cert-person">{user.name}</h2>

              <div className="cert-underline"></div>

              <p className="cert-achievement">
                U <strong>{course.title}</strong> kursini muvaffaqiyatli yakunladi
                va barcha talab qilingan testlardan o'tdi.
              </p>
            </div>

            <div className="cert-bottom">
              <div className="cert-info-item">
                <div className="cert-info-icon"><Calendar size={16} /></div>
                <div>
                  <div className="cert-info-label">Sana</div>
                  <div className="cert-info-value">{today}</div>
                </div>
              </div>

              <div className="cert-info-item">
                <div className="cert-info-icon"><BookOpen size={16} /></div>
                <div>
                  <div className="cert-info-label">Darslar</div>
                  <div className="cert-info-value">{course.lessons?.length || course.darslar || 0} ta</div>
                </div>
              </div>

              <div className="cert-info-item">
                <div className="cert-info-icon"><CheckCircle2 size={16} /></div>
                <div>
                  <div className="cert-info-label">Sertifikat ID</div>
                  <div className="cert-info-value">{certId}</div>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="cert-watermark">EduUz</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificate