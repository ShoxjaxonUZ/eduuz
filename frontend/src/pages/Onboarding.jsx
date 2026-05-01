import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Bot,
  User, Target, Clock, Heart, Briefcase, GraduationCap,
  Loader2, BookOpen, Star, Trophy, Globe, Smartphone,
  Palette, Gamepad2, BarChart3, Shield, Languages, Calculator
} from 'lucide-react'
import '../styles/onboarding.css'

const ICON_MAP = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  palette: Palette,
  gamepad: Gamepad2,
  barchart: BarChart3,
  shield: Shield,
  briefcase: Briefcase,
  languages: Languages,
  calculator: Calculator
}

// Savollar — tartiblangan
const STEPS = ['welcome', 'age', 'experience', 'goal', 'field', 'interests', 'time', 'result']

const QUESTIONS = {
  age: {
    title: 'Yoshingiz qaysi guruhda?',
    subtitle: 'Sizga mos kurslarni tanlash uchun',
    Icon: User,
    options: [
      { value: '10-14', label: '10-14 yosh', desc: 'O\'quvchi' },
      { value: '15-18', label: '15-18 yosh', desc: 'Maktabni bitirayotgan' },
      { value: '19-25', label: '19-25 yosh', desc: 'Talaba yoki yangi mutaxassis' },
      { value: '26-35', label: '26-35 yosh', desc: 'Faol kasbiy davr' },
      { value: '36+', label: '36+ yosh', desc: 'Tajribali mutaxassis' }
    ]
  },
  experience: {
    title: 'Tajribangiz qanday?',
    subtitle: 'Dasturlash yoki IT bilan tanishligingiz',
    Icon: GraduationCap,
    options: [
      { value: 'beginner', label: 'Yangi boshlovchi', desc: 'Hech qachon o\'rganmaganman' },
      { value: 'basic', label: 'Asoslarni bilaman', desc: 'Bir oz tushunaman' },
      { value: 'intermediate', label: 'O\'rta daraja', desc: 'Bir nechta loyiha qildim' },
      { value: 'advanced', label: 'Ilg\'or daraja', desc: 'Faol amaliyotim bor' }
    ]
  },
  goal: {
    title: 'Asosiy maqsadingiz nima?',
    subtitle: 'EduUz dan nimaga erishmoqchisiz?',
    Icon: Target,
    options: [
      { value: 'kasb', label: 'Yangi kasb egallash', desc: 'IT, dizayn, biznes va boshqalar' },
      { value: 'maktab', label: 'Maktab yoki Universitet', desc: 'O\'qishimga yordam kerak' },
      { value: 'qiziqish', label: 'Yangi narsa o\'rganish', desc: 'Hobbi va qiziqish uchun' },
      { value: 'karyera', label: 'Karyerada o\'sish', desc: 'Yuqori darajaga ko\'tarilish' },
      { value: 'biznes', label: 'O\'z biznesimni ochish', desc: 'Tadbirkorlik' }
    ]
  },
  field: {
    title: 'Qaysi soha sizga eng yoqadi?',
    subtitle: 'Asosiy yo\'nalishni tanlang',
    Icon: Briefcase,
    options: [
      { value: 'dasturlash', label: 'Dasturlash', desc: 'Web, mobil va AI ilovalar' },
      { value: 'dizayn', label: 'Dizayn', desc: 'UI/UX va grafika' },
      { value: 'biznes', label: 'Biznes', desc: 'Marketing va boshqaruv' },
      { value: 'matematika', label: 'Matematika va fan', desc: 'Hisoblash va fizika' },
      { value: 'til', label: 'Til o\'rganish', desc: 'Ingliz tili va boshqalar' }
    ]
  },
  interests: {
    title: 'Nimalar sizni qiziqtiradi?',
    subtitle: 'Bir nechta tanlashingiz mumkin',
    Icon: Heart,
    multiple: true,
    options: [
      { value: 'web', label: 'Web sayt yaratish', iconName: 'globe' },
      { value: 'mobile', label: 'Mobil ilovalar', iconName: 'smartphone' },
      { value: 'ai', label: 'Sun\'iy intellekt', iconName: 'bot' },
      { value: 'design', label: 'Dizayn va grafika', iconName: 'palette' },
      { value: 'gamedev', label: 'O\'yin yaratish', iconName: 'gamepad' },
      { value: 'data', label: 'Ma\'lumotlar tahlili', iconName: 'barchart' },
      { value: 'cyber', label: 'Kiberxavfsizlik', iconName: 'shield' },
      { value: 'business', label: 'Biznes va marketing', iconName: 'briefcase' },
      { value: 'languages', label: 'Til o\'rganish', iconName: 'languages' },
      { value: 'math', label: 'Matematika va fan', iconName: 'calculator' }
    ]
  },
  time: {
    title: 'Kuniga qancha vaqt ajrata olasiz?',
    subtitle: 'Realistik baholang',
    Icon: Clock,
    options: [
      { value: '15min', label: '15 daqiqa', desc: 'Juda bandman' },
      { value: '30min', label: '30 daqiqa', desc: 'Kuniga oz bo\'lsa ham' },
      { value: '1hour', label: '1 soat', desc: 'Oddiy temp' },
      { value: '2hours', label: '2 soat', desc: 'Faol o\'rganish' },
      { value: '3hours+', label: '3 soatdan ortiq', desc: 'Intensiv o\'rganish' }
    ]
  }
}

function Onboarding() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    ageGroup: '',
    experience: '',
    goal: '',
    preferredField: '',
    interests: [],
    availableTime: ''
  })

  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Konsultatsiya — EduUz"
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/onboarding/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.onboarded) {
        navigate('/')
      }
    } catch {}
  }

  const currentStepName = STEPS[step]
  const totalSteps = STEPS.length - 2 // welcome va result hisobga olinmaydi
  const progress = step === 0 ? 0 : Math.min(100, ((step) / totalSteps) * 100)

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  const fieldKeyMap = {
    age: 'ageGroup',
    experience: 'experience',
    goal: 'goal',
    field: 'preferredField',
    interests: 'interests',
    time: 'availableTime'
  }

  const isLastQuestion = currentStepName === 'time'

  const selectOption = (questionKey, value, isMultiple = false) => {
    if (isMultiple) {
      setAnswers(prev => {
        const current = prev[questionKey] || []
        const exists = current.includes(value)
        return {
          ...prev,
          [questionKey]: exists ? current.filter(v => v !== value) : [...current, value]
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [questionKey]: value }))
      // Oxirgi savol bo'lmasa avtomatik keyingi
      if (!isLastQuestion) {
        setTimeout(() => next(), 300)
      }
    }
  }

  const completeOnboarding = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5000/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...answers, chatHistory: '' })
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        next()
      }
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  // ============ WELCOME ============
  if (currentStepName === 'welcome') {
    return (
      <div className="onb-page">
        <div className="onb-bg-glow"></div>
        <div className="onb-welcome">
          <div className="onb-welcome-icon">
            <Sparkles size={64} />
          </div>
          <h1>Salom, {user?.name}!</h1>
          <p className="onb-welcome-sub">
            EduUz ga xush kelibsiz! Sizga eng mos kurslarni tavsiya qilish uchun
            bir necha savol so'raymiz. Atigi 1-2 daqiqa vaqtingizni oladi.
          </p>

          <div className="onb-features">
            <div className="onb-feature-item">
              <CheckCircle2 size={16} color="#22c55e" />
              <span>6 ta oddiy savol</span>
            </div>
            <div className="onb-feature-item">
              <CheckCircle2 size={16} color="#22c55e" />
              <span>AI shaxsiy tavsiya</span>
            </div>
            <div className="onb-feature-item">
              <CheckCircle2 size={16} color="#22c55e" />
              <span>Mos kurslar avtomatik tanlanadi</span>
            </div>
          </div>

          <button className="btn-primary btn-hero" onClick={next}>
            <Sparkles size={18} /> Boshlash
          </button>
        </div>
      </div>
    )
  }

  // ============ RESULT ============
  if (currentStepName === 'result' && result) {
    return (
      <div className="onb-page">
        <div className="onb-bg-glow"></div>
        <div className="onb-result">
          <div className="onb-result-icon">
            <Trophy size={72} />
          </div>
          <div className="onb-badge">
            <Sparkles size={14} /> Tavsiyalar tayyor
          </div>
          <h1>Sizga eng mos <span className="gradient-text">kurslar tanlandi</span></h1>

          {result.advice && (
            <div className="onb-advice-box">
              <Bot size={24} color="#8b5cf6" />
              <div>
                <h4>AI maslahati</h4>
                <p>{result.advice}</p>
              </div>
            </div>
          )}

          {result.studyPlan && (
            <div className="onb-advice-box" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.08)' }}>
              <Target size={24} color="#22c55e" />
              <div>
                <h4>O'qish rejasi</h4>
                <p>{result.studyPlan}</p>
              </div>
            </div>
          )}

          <h3 className="onb-recom-title">
            <Star size={20} color="#f59e0b" /> Tavsiya etilgan kurslar
          </h3>

          <div className="onb-recom-list">
            {result.recommendedCourses?.map(course => (
              <div key={course.id} className="onb-recom-card" onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="onb-recom-icon">
                  <BookOpen size={28} />
                </div>
                <div className="onb-recom-info">
                  <h4>{course.title}</h4>
                  <div className="onb-recom-meta">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>{course.daraja}</span>
                  </div>
                </div>
                <ArrowRight size={20} color="var(--primary-light)" />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
            <button className="btn-outline" onClick={() => navigate('/')}>
              Bosh sahifa
            </button>
            <button className="btn-primary btn-hero" onClick={() => navigate('/courses')}>
              <BookOpen size={18} /> Kurslarga o'tish
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ TEST QUESTIONS ============
  const question = QUESTIONS[currentStepName]
  if (!question) return null

  const QIcon = question.Icon
  const isMultiple = question.multiple
  const fieldKey = fieldKeyMap[currentStepName]
  const currentValue = answers[fieldKey]
  const canContinue = isMultiple ? (currentValue?.length > 0) : !!currentValue

  return (
    <div className="onb-page">
      <div className="onb-progress-bar">
        <div className="onb-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="onb-container">
        <div className="onb-step-counter">
          {step}-bosqich / {totalSteps}
        </div>

        <div className="onb-question-icon">
          <QIcon size={36} />
        </div>

        <h2 className="onb-question-title">{question.title}</h2>
        <p className="onb-question-sub">{question.subtitle}</p>

        <div className={`onb-options ${isMultiple ? 'onb-options-multi' : ''}`}>
          {question.options.map(opt => {
            const isSelected = isMultiple
              ? currentValue?.includes(opt.value)
              : currentValue === opt.value
            const OptIcon = opt.iconName ? ICON_MAP[opt.iconName] : null

            return (
              <button
                key={opt.value}
                className={`onb-option ${isSelected ? 'onb-option-active' : ''}`}
                onClick={() => selectOption(fieldKey, opt.value, isMultiple)}
              >
                {OptIcon && (
                  <div className="onb-option-icon">
                    <OptIcon size={20} />
                  </div>
                )}
                <div className="onb-option-text">
                  <div className="onb-option-label">{opt.label}</div>
                  {opt.desc && <div className="onb-option-desc">{opt.desc}</div>}
                </div>
                {isSelected && <CheckCircle2 size={18} color="#22c55e" />}
              </button>
            )
          })}
        </div>

        <div className="onb-nav">
          {step > 1 && (
            <button className="btn-outline" onClick={back}>
              <ArrowLeft size={16} /> Orqaga
            </button>
          )}

          {/* Oxirgi savol — Tavsiyalarni olish tugmasi */}
          {isLastQuestion && canContinue && (
            <button
              className="btn-primary btn-hero"
              onClick={completeOnboarding}
              disabled={submitting}
              style={{ marginLeft: 'auto' }}
            >
              {submitting ? (
                <><Loader2 size={18} className="spin" /> Tahlil qilinmoqda...</>
              ) : (
                <><Sparkles size={18} /> Tavsiyalarni olish</>
              )}
            </button>
          )}

          {/* Multiple — Keyingi tugmasi */}
          {isMultiple && !isLastQuestion && (
            <button
              className="btn-primary"
              onClick={next}
              disabled={!canContinue}
              style={{ marginLeft: 'auto' }}
            >
              Keyingi <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding