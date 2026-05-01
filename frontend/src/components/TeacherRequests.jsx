import { useState, useEffect } from 'react'

function TeacherRequests({ token }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/teacher/requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teacher/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p>Yuklanmoqda...</p>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>O'qituvchi arizalari</h2>
          <p>Jami {requests.length} ta ariza</p>
        </div>
      </div>

      <div className="admin-table-card">
        {requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
            Hali ariza yo'q
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Fan</th>
                <th>Tajriba</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">{r.name[0].toUpperCase()}</div>
                      <div>
                        <span style={{ display: 'block', fontWeight: '600' }}>{r.name}</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{r.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{r.subject}</td>
                  <td style={{ maxWidth: '200px', fontSize: '13px', color: '#6b7280' }}>
                    {r.experience?.substring(0, 80)}...
                  </td>
                  <td>
                    <span className={`badge ${
                      r.status === 'approved' ? 'badge-green' :
                      r.status === 'rejected' ? 'badge-red' : 'badge-purple'
                    }`}>
                      {r.status === 'approved' ? '✅ Tasdiqlandi' :
                       r.status === 'rejected' ? '❌ Rad etildi' : '⏳ Kutmoqda'}
                    </span>
                  </td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="table-actions">
                        <button className="btn-edit" onClick={() => handleAction(r.id, 'approved')}>
                          ✅ Tasdiqlash
                        </button>
                        <button className="btn-delete" onClick={() => handleAction(r.id, 'rejected')}>
                          ❌ Rad etish
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TeacherRequests