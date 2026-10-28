import { useCallback, useState } from 'react'
import { api } from '../api'
import { GoogleLoginButton } from './GoogleLoginButton'

function Message({ text, ok }) {
  if (!text) return null
  return <div className={`msg ${ok ? 'msg-ok' : 'msg-error'}`}>{text}</div>
}

export function AuthPages({ onLogin, token, user }) {
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({
    username: '',
    password: '',
    role: 'HR',
  })
  const [msg, setMsg] = useState({ text: '', ok: false })
  const [loading, setLoading] = useState(false)
  const handleGoogleError = useCallback((text) => setMsg({ text, ok: false }), [])

  async function handleLogin(e) {
    e.preventDefault()
    setMsg({ text: '', ok: false })
    setLoading(true)
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      onLogin(res.token, res.user)
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setMsg({ text: '', ok: false })

    if (!token || user?.role !== 'Admin') {
      setMsg({
        text: 'Only Admin can register users. Please login as Admin first.',
        ok: false,
      })
      setTab('login')
      return
    }

    setLoading(true)
    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        token,
        body: JSON.stringify(regForm),
      })
      setMsg({
        text: `${res.message}: ${res.data.username} (${res.data.role})`,
        ok: true,
      })
      setRegForm({ username: '', password: '', role: 'HR' })
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-wrap">
      <div className="login-card">
        <h1 className="brand">Admin<span>Portal</span></h1>
        <p className="subtitle">Sirf Admin login — HR & Manager Admin ke under</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => { setTab('login'); setMsg({ text: '', ok: false }) }}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'active' : ''}
            onClick={() => { setTab('register'); setMsg({ text: '', ok: false }) }}
          >
            Register
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Username</label>
              <input
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                placeholder="admin"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
            <GoogleLoginButton
              onLogin={onLogin}
              onError={handleGoogleError}
            />
            <Message text={msg.text} ok={msg.ok} />
            <p className="hint">
              Only <strong>Admin</strong> can login.<br />
              Login ke baad Admin dashboard me <strong>HR</strong> aur <strong>Manager</strong> sections milenge.<br />
              Demo: <strong>admin</strong> / <strong>password123</strong><br />
              Koi bhi Google account se login ho jayega.
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <p className="hint" style={{ marginTop: 0, marginBottom: 16 }}>
              Register sirf <strong>Admin</strong> kar sakta hai.
              {user?.role === 'Admin'
                ? ` Logged in as @${user.username}`
                : ' Pehle Admin se login karein.'}
            </p>
            <div className="field">
              <label>New Username</label>
              <input
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select
                value={regForm.role}
                onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register User'}
            </button>
            <Message text={msg.text} ok={msg.ok} />
          </form>
        )}
      </div>
    </section>
  )
}
