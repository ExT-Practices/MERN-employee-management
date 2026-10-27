import { useState } from 'react'
import { AddEmployee, UpdateEmployee } from '../components/EmployeeForms'

const TABS = [
  { key: 'add', label: 'Add Employee' },
  { key: 'update', label: 'Update Employee' },
]

export default function HRDashboard({ token, user, onLogout, onShowAuth }) {
  const [tab, setTab] = useState('add')

  return (
    <section className="shell">
      <aside className="sidebar">
        <div className="brand">HR<span>Hub</span></div>
        <div className="role-badge">HR Dashboard</div>
        <nav>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`nav-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={onShowAuth}>
          Login / Register page
        </button>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={onLogout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <p className="eyebrow">Role-based dashboard</p>
            <h1>HR Dashboard</h1>
          </div>
          <span className="subtitle" style={{ margin: 0 }}>@{user.username}</span>
        </div>
        {tab === 'add' && <AddEmployee token={token} />}
        {tab === 'update' && <UpdateEmployee token={token} />}
      </main>
    </section>
  )
}
