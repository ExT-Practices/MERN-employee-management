import { ViewEmployees } from '../components/EmployeeForms'

export default function ManagerDashboard({ token, user, onLogout, onShowAuth }) {
  return (
    <section className="shell">
      <aside className="sidebar">
        <div className="brand">Manager<span>Hub</span></div>
        <div className="role-badge">Manager Dashboard</div>
        <nav>
          <button className="nav-btn active">View Employees</button>
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
            <h1>Manager Dashboard</h1>
          </div>
          <span className="subtitle" style={{ margin: 0 }}>@{user.username}</span>
        </div>
        <ViewEmployees token={token} />
      </main>
    </section>
  )
}
