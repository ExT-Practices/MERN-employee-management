import { useState } from 'react'
import {
  AddEmployee,
  UpdateEmployee,
  DeleteEmployee,
  RegisterUsers,
  ViewEmployees,
} from '../components/EmployeeForms'

const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    items: [
      { key: 'admin-add', label: 'Add Employee' },
      { key: 'admin-update', label: 'Update Employee' },
      { key: 'admin-delete', label: 'Delete Employee' },
      { key: 'admin-view', label: 'View Employees' },
      { key: 'admin-register', label: 'Register User' },
    ],
  },
  {
    key: 'hr',
    label: 'HR',
    items: [
      { key: 'hr-add', label: 'Add Employee' },
      { key: 'hr-update', label: 'Update Employee' },
      { key: 'hr-view', label: 'View Employees' },
    ],
  },
  {
    key: 'manager',
    label: 'Manager',
    items: [{ key: 'manager-view', label: 'View Employees' }],
  },
]

export default function AdminDashboard({ token, user, onLogout, onShowAuth }) {
  const [role, setRole] = useState('admin')
  const [tab, setTab] = useState('admin-add')

  const activeRole = ROLES.find((r) => r.key === role)

  function selectRole(nextRole) {
    setRole(nextRole)
    const first = ROLES.find((r) => r.key === nextRole)?.items[0]
    if (first) setTab(first.key)
  }

  return (
    <section className="shell">
      <aside className="sidebar">
        <div className="brand">Admin<span>Hub</span></div>
        <div className="role-badge">Admin Login</div>
        <p className="sidebar-note">HR & Manager is Admin ke under</p>

        <div className="role-switch">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`role-switch-btn ${role === r.key ? 'active' : ''}`}
              onClick={() => selectRole(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <nav>
          {activeRole?.items.map((t) => (
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
            <p className="eyebrow">Admin → {activeRole?.label} role</p>
            <h1>
              {role === 'admin' && 'Admin Section'}
              {role === 'hr' && 'HR Section'}
              {role === 'manager' && 'Manager Section'}
            </h1>
          </div>
          <span className="subtitle" style={{ margin: 0 }}>@{user.username}</span>
        </div>

        {(tab === 'admin-add' || tab === 'hr-add') && <AddEmployee token={token} />}
        {(tab === 'admin-update' || tab === 'hr-update') && <UpdateEmployee token={token} />}
        {tab === 'admin-delete' && <DeleteEmployee token={token} />}
        {tab === 'admin-register' && <RegisterUsers token={token} />}
        {(tab === 'admin-view' || tab === 'hr-view') && (
          <ViewEmployees token={token} showActions />
        )}
        {tab === 'manager-view' && <ViewEmployees token={token} />}
      </main>
    </section>
  )
}
