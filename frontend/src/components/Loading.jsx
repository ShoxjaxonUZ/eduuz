import '../styles/loading.css'

function Loading({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="loading-page">
      <div className="loading-card">
        <div className="spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  )
}

export default Loading