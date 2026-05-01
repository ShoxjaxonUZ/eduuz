import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  GraduationCap, Sun, Moon, Menu, Settings,
  User, LayoutDashboard, LogOut, BookOpen, Swords, Bot, Trophy
} from 'lucide-react'
import '../styles/navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const closeTimeoutRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user'))

  const goTo = (path) => {
    navigate(path)
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 300)
  }

  return (
    <>
      <header className="navbar-wrap">
        <nav className="navbar">

          {/* Logo */}
          <div className="nav-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <GraduationCap size={22} />
            </div>
            <span className="logo-text">EduUz</span>
          </div>

          {/* Center links */}
          <div className="nav-center">
            <span onClick={() => goTo('/courses')}>Kurslar</span>
            <span onClick={() => goTo('/daily')}>Kunlik</span>
            <span onClick={() => goTo('/battle')}>Battle</span>
            <span onClick={() => goTo('/ai-teacher')}>AI Teacher</span>
            <span onClick={() => goTo('/leaderboard')}>Reyting</span>
          </div>

          {/* Right */}
          <div className="nav-right">
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme} title="Rejimni o'zgartirish">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <button className="nav-dashboard" onClick={() => goTo('/dashboard')}>
                  Dashboard
                </button>

                {/* Avatar + Dropdown */}
                <div
                  className="nav-avatar-wrap"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="nav-avatar">
                    {user.name[0].toUpperCase()}
                  </div>

                  {dropdownOpen && (
                    <div className="nav-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="dropdown-name">{user.name}</div>
                          <div className="dropdown-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={() => goTo('/profile')}>
                        <User size={16} /> Profil
                      </button>
                      {user.email === 'admin@eduuz.uz' && (
                        <button className="dropdown-item" onClick={() => goTo('/admin')}>
                          <Settings size={16} /> Admin panel
                        </button>
                      )}
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Chiqish
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="btn-outline" onClick={() => goTo('/login')}>Kirish</button>
                <button className="btn-primary" onClick={() => goTo('/register')}>Ro'yxatdan o'tish</button>
              </>
            )}

            {/* Hamburger (mobile) */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-inner" onClick={e => e.stopPropagation()}>
            {user && (
              <div className="mobile-user">
                <div className="mobile-avatar">{user.name[0].toUpperCase()}</div>
                <div>
                  <div className="mobile-name">{user.name}</div>
                  <div className="mobile-email">{user.email}</div>
                </div>
              </div>
            )}

            <div className="mobile-links">
              <button onClick={() => goTo('/courses')}>
                <BookOpen size={18} /> Kurslar
              </button>
              <button onClick={() => goTo('/battle')}>
                <Swords size={18} /> Battle
              </button>
              <button onClick={() => goTo('/ai-teacher')}>
                <Bot size={18} /> AI Teacher
              </button>
              <button onClick={() => goTo('/leaderboard')}>
                <Trophy size={18} /> Reyting
              </button>
              <button onClick={() => goTo('/ai-quiz')}>
                <Bot size={18} /> AI Test
              </button>
              {user && (
                <button onClick={() => goTo('/dashboard')}>
                  <LayoutDashboard size={18} /> Dashboard
                </button>
              )}
              {user && (
                <button onClick={() => goTo('/profile')}>
                  <User size={18} /> Profil
                </button>
              )}
              {user?.email === 'admin@eduuz.uz' && (
                <button onClick={() => goTo('/admin')}>
                  <Settings size={18} /> Admin panel
                </button>
              )}
              <button onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <><Sun size={18} /> Kunduzgi rejim</>
                ) : (
                  <><Moon size={18} /> Tungi rejim</>
                )}
              </button>
            </div>

            <div className="mobile-actions">
              {!user ? (
                <>
                  <button className="btn-outline" onClick={() => goTo('/login')}>Kirish</button>
                  <button className="btn-primary" onClick={() => goTo('/register')}>
                    Ro'yxatdan o'tish
                  </button>
                </>
              ) : (
                <button className="btn-danger-outline" onClick={handleLogout}>
                  <LogOut size={18} /> Chiqish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar