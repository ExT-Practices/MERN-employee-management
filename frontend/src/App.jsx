import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { useEmployeeTable } from './hooks/useEmployeeTable'
import { TablePagination, TableToolbar } from './components/TableToolbar'
import { GoogleLoginButton } from './components/GoogleLoginButton'
import './index.css'

function Message({ text, ok }) {
  if (!text) return null
  return <div className={`msg ${ok ? 'msg-ok' : 'msg-error'}`}>{text}</div>
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const handleGoogleError = useCallback((text) => setMsg(text), [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      onLogin(res.token, res.user)
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-wrap">
      <div className="login-card">
        <h1 className="brand">Employee<span>App</span></h1>
        <p className="subtitle">Employee frontend · Login</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="employee2" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
          <GoogleLoginButton
            onLogin={onLogin}
            onError={handleGoogleError}
          />
          <Message text={msg} />
        </form>
        <p className="hint">
          Employee only. Password: <strong>password123</strong><br />
          Try: employee2 / sneha / Iksha<br />
          Google se bhi login kar sakte ho.
        </p>
      </div>
    </section>
  )
}

function EmployeeDashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState({ text: '', ok: false })
  const [deleteId, setDeleteId] = useState('')
  const table = useEmployeeTable(rows)

  async function loadProfile() {
    try {
      const res = await api('/api/employees/me', { token })
      setProfile(res.data)
      setMsg({ text: '', ok: false })
    } catch (err) {
      setProfile(null)
      setMsg({ text: err.message, ok: false })
    }
  }

  async function loadAll() {
    try {
      const res = await api('/api/employees', { token })
      setRows(res.data || [])
      setMsg({ text: '', ok: false })
    } catch (err) {
      setRows([])
      setMsg({ text: err.message, ok: false })
    }
  }

  useEffect(() => {
    if (tab === 'profile') loadProfile()
    if (tab === 'all') loadAll()
  }, [tab, token])

  async function handleDelete(id) {
    if (!window.confirm(`Delete employee #${id}?`)) return
    try {
      await api(`/api/employees/${id}`, { method: 'DELETE', token })
      setMsg({ text: `Employee #${id} deleted`, ok: true })
      if (tab === 'all') loadAll()
      setDeleteId('')
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  return (
    <section className="shell">
      <aside className="sidebar">
        <div className="brand">Employee<span>App</span></div>
        <div className="role-badge">Employee Dashboard</div>
        <nav>
          <button className={`nav-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            My Profile
          </button>
          <button className={`nav-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All Employees
          </button>
          <button className={`nav-btn ${tab === 'delete' ? 'active' : ''}`} onClick={() => setTab('delete')}>
            Delete Employee
          </button>
        </nav>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 24, width: '100%' }} onClick={onLogout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)', fontSize: '0.78rem', marginBottom: 6 }}>
              Frontend · Employee
            </p>
            <h1>
              {tab === 'profile' && 'My Profile'}
              {tab === 'all' && 'All Employees'}
              {tab === 'delete' && 'Delete Employee'}
            </h1>
          </div>
          <span className="subtitle" style={{ margin: 0 }}>@{user.username}</span>
        </div>

        {tab === 'profile' && (
          <div className="panel">
            {!profile ? (
              <div className="empty">No profile linked / loading…</div>
            ) : (
              <div className="profile-grid">
                {[
                  ['ID', profile.id],
                  ['Code', profile.emp_code],
                  ['Name', `${profile.first_name} ${profile.last_name}`],
                  ['Email', profile.email],
                  ['Phone', profile.phone || '—'],
                  ['Department', profile.department || '—'],
                  ['Designation', profile.designation || '—'],
                  ['Salary', profile.salary ?? '—'],
                  ['Status', profile.status || '—'],
                ].map(([label, val]) => (
                  <div className="profile-item" key={label}>
                    <label>{label}</label>
                    <strong>{val}</strong>
                  </div>
                ))}
              </div>
            )}
            <Message text={msg.text} ok={msg.ok} />
          </div>
        )}

        {tab === 'all' && (
          <div className="panel">
            <div className="form-actions" style={{ marginTop: 0, marginBottom: 16 }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={loadAll}>Refresh</button>
            </div>
            <TableToolbar
              search={table.search}
              setSearch={table.setSearch}
              status={table.status}
              setStatus={table.setStatus}
              department={table.department}
              setDepartment={table.setDepartment}
              departments={table.departments}
              size={table.size}
              setSize={table.setSize}
              filteredCount={table.filteredCount}
              totalCount={rows.length}
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Code</th><th>Name</th><th>Email</th>
                    <th>Dept</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {table.pageRows.length === 0 ? (
                    <tr><td colSpan="7" className="empty">No employees</td></tr>
                  ) : (
                    table.pageRows.map((e) => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>{e.emp_code}</td>
                        <td>{e.first_name} {e.last_name}</td>
                        <td>{e.email}</td>
                        <td>{e.department || '—'}</td>
                        <td>{e.status}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination page={table.page} setPage={table.setPage} totalPages={table.totalPages} />
            <Message text={msg.text} ok={msg.ok} />
          </div>
        )}

        {tab === 'delete' && (
          <div className="panel">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleDelete(deleteId)
              }}
            >
              <div className="field" style={{ maxWidth: 220 }}>
                <label>Employee ID *</label>
                <input
                  type="number"
                  min="1"
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-danger" type="submit">Delete Employee</button>
              </div>
              <Message text={msg.text} ok={msg.ok} />
            </form>
          </div>
        )}
      </main>
    </section>
  )
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('emp_token') || '')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('emp_user') || 'null'))

  useEffect(() => {
    function onExpired() {
      localStorage.removeItem('emp_token')
      localStorage.removeItem('emp_user')
      setToken('')
      setUser(null)
    }
    window.addEventListener('auth-expired', onExpired)
    return () => window.removeEventListener('auth-expired', onExpired)
  }, [])

  function handleLogin(nextToken, nextUser) {
    localStorage.setItem('emp_token', nextToken)
    localStorage.setItem('emp_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  function handleLogout() {
    localStorage.removeItem('emp_token')
    localStorage.removeItem('emp_user')
    setToken('')
    setUser(null)
  }

  // Default: Login page
  if (!token || !user) return <Login onLogin={handleLogin} />

  return <EmployeeDashboard token={token} user={user} onLogout={handleLogout} />
}
