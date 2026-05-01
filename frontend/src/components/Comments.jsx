import { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2, User } from 'lucide-react'
import '../styles/comments.css'

function Comments({ courseId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadComments()
  }, [courseId])

  const loadComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${courseId}`)
      const data = await res.json()
      if (Array.isArray(data)) setComments(data)
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async () => {
    if (!token) return alert('Izoh qoldirish uchun kiring!')
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: String(courseId), text: text.trim() })
      })
      if (res.ok) {
        setText('')
        loadComments()
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Izohni o\'chirishni xohlaysizmi?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) loadComments()
    } catch (err) { console.error(err) }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Hozir'
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
    if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`
    return date.toLocaleDateString('uz-UZ')
  }

  // Avatar rangini ismga qarab olish
  const getColor = (name) => {
    const colors = ['#8b5cf6', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#10b981']
    const index = name?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <div className="comments-title">
          <MessageCircle size={22} />
          <h3>Izohlar</h3>
          <span className="comments-count">{comments.length}</span>
        </div>
      </div>

      {/* Izoh qoldirish */}
      {user ? (
        <div className="comment-form">
          <div className="comment-avatar" style={{ background: getColor(user.name) }}>
            {user.name[0].toUpperCase()}
          </div>
          <div className="comment-form-wrap">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Fikringizni qoldiring..."
              rows={3}
            />
            <div className="comment-form-actions">
              <span className="comment-form-hint">
                {text.length}/500 belgi
              </span>
              <button
                className="btn-primary comment-submit"
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
              >
                <Send size={14} /> {loading ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="comment-login-prompt">
          <User size={28} />
          <p>Izoh qoldirish uchun akkauntga kiring</p>
        </div>
      )}

      {/* Izohlar ro'yxati */}
      {comments.length === 0 ? (
        <div className="comments-empty">
          <MessageCircle size={48} />
          <p>Hali izohlar yo'q</p>
          <span>Birinchi bo'lib fikringizni bildiring!</span>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar" style={{ background: getColor(c.user_name) }}>
                {c.user_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="comment-body">
                <div className="comment-top">
                  <div>
                    <div className="comment-author">{c.user_name}</div>
                    <div className="comment-date">{formatDate(c.created_at)}</div>
                  </div>
                  {(user?.id === c.user_id || user?.email === 'admin@eduuz.uz') && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(c.id)}
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments