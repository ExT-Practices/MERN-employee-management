import { useEffect, useState } from 'react'
import { AuthPages } from './components/AuthPages'
import AdminDashboard from './dashboards/AdminDashboard'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const [showAuth, setShowAuth] = useState(() => !localStorage.getItem('admin_token'))

  useEffect(() => {
    function onExpired() {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      setToken('')
      setUser(null)
      setShowAuth(true)
    }
    window.addEventListener('auth-expired', onExpired)
    return () => window.removeEventListener('auth-expired', onExpired)
  }, [])

  function handleLogin(nextToken, nextUser) {
    localStorage.setItem('admin_token', nextToken)
    localStorage.setItem('admin_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
    setShowAuth(false)
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken('')
    setUser(null)
    setShowAuth(true)
  }

  // Default: Login / Register
  if (showAuth || !token || !user) {
    return <AuthPages onLogin={handleLogin} token={token} user={user} />
  }

  // Only Admin login — HR & Manager live under Admin dashboard
  if (user.role === 'Admin') {
    return (
      <AdminDashboard
        token={token}
        user={user}
        onLogout={handleLogout}
        onShowAuth={() => setShowAuth(true)}
      />
    )
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <p>Only Admin can login here. HR and Manager are inside Admin dashboard.</p>
        <button className="btn btn-primary" onClick={handleLogout}>Back to Login</button>
      </div>
    </div>
  )
}
