import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Courses from './pages/courses'
import CourseDetail from './pages/coursedetail'
import Dashboard from './pages/dashboard'
import Certificate from './pages/certificate'
import Admin from './pages/admin'
import Profile from './pages/profile'
import Footer from './components/Footer'
import NotFound from './pages/NotFound'
import Lesson from './pages/Lesson'
import AIQuiz from './pages/AIQuiz'
import Battle from './pages/Battle'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import About from './pages/About'
import Contact from './pages/Contact'
import Help from './pages/Help'
import Privacy from './pages/Privacy'
import AITeacher from './pages/AITeacher'
import Leaderboard from './pages/Leaderboard'
import Onboarding from './pages/Onboarding'
import Daily from './pages/Daily'
import ModuleTest from './pages/ModuleTest'

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/courses/:courseId/lessons/:lessonIndex" element={<Lesson />} />
            <Route path="/ai-quiz" element={<AIQuiz />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/ai-teacher" element={<AITeacher />} />
            <Route path="/leaderboard" element={<Leaderboard />} /><Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/courses/:courseId/module-test/:moduleIndex" element={<ModuleTest />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App