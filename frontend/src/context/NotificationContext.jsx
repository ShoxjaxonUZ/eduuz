import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const NotificationContext = createContext()

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info') => {
    const id = ++idCounter + '-' + Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }, [])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
  }

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notif-wrap">
        {notifications.map(n => (
          <div key={n.id} className={`notif notif-${n.type}`}>
            <div className="notif-icon">{icons[n.type]}</div>
            <div className="notif-msg">{n.message}</div>
            <button className="notif-close" onClick={() => removeNotification(n.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)