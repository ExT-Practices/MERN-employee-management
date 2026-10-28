import { useEffect, useState } from 'react'
import { api } from '../api'
import { useEmployeeTable } from '../hooks/useEmployeeTable'
import { TablePagination, TableToolbar } from './TableToolbar'

function Message({ text, ok }) {
  if (!text) return null
  return <div className={`msg ${ok ? 'msg-ok' : 'msg-error'}`}>{text}</div>
}

export function AddEmployee({ token }) {
  const [form, setForm] = useState({
    emp_code: '', first_name: '', last_name: '', email: '', phone: '',
    department: '', designation: '', salary: '', date_of_joining: '',
    username: '', password: '',
  })
  const [createLogin, setCreateLogin] = useState(false)
  const [msg, setMsg] = useState({ text: '', ok: false })

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ text: '', ok: false })
    try {
      const body = {
        emp_code: form.emp_code,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        department: form.department || null,
        designation: form.designation || null,
        salary: form.salary ? Number(form.salary) : 0,
        date_of_joining: form.date_of_joining || null,
        create_login: createLogin,
      }
      if (createLogin) {
        body.username = form.username
        body.password = form.password
      }
      const res = await api('/api/employees', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      })
      setMsg({
        text: `${res.message} — ID: ${res.data?.id}, Code: ${res.data?.emp_code}`,
        ok: true,
      })
      setForm({
        emp_code: '', first_name: '', last_name: '', email: '', phone: '',
        department: '', designation: '', salary: '', date_of_joining: '',
        username: '', password: '',
      })
      setCreateLogin(false)
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Add Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {[
            ['emp_code', 'Emp Code *', 'text'],
            ['email', 'Email *', 'email'],
            ['first_name', 'First Name *', 'text'],
            ['last_name', 'Last Name *', 'text'],
            ['phone', 'Phone', 'text'],
            ['department', 'Department', 'text'],
            ['designation', 'Designation', 'text'],
            ['salary', 'Salary', 'number'],
            ['date_of_joining', 'Date of Joining', 'date'],
          ].map(([key, label, type]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                required={label.includes('*')}
              />
            </div>
          ))}
        </div>
        <label className="check-row">
          <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
          Also create Employee login
        </label>
        {createLogin && (
          <div className="grid-2">
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={(e) => set('username', e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>
          </div>
        )}
        <div className="form-actions">
          <button className="btn btn-primary btn-auto" type="submit">Add Employee</button>
        </div>
        <Message text={msg.text} ok={msg.ok} />
      </form>
    </div>
  )
}

function toDateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function employeeToForm(employee) {
  if (!employee) {
    return {
      first_name: '', last_name: '', email: '', phone: '',
      department: '', designation: '', salary: '', date_of_joining: '', status: '',
    }
  }
  return {
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    designation: employee.designation || '',
    salary: employee.salary ?? '',
    date_of_joining: toDateInput(employee.date_of_joining),
    status: employee.status || '',
  }
}

export function UpdateEmployee({ token, employee = null, onDone }) {
  const [id, setId] = useState(employee?.id ? String(employee.id) : '')
  const [form, setForm] = useState(() => employeeToForm(employee))
  const [msg, setMsg] = useState({ text: '', ok: false })

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ text: '', ok: false })
    const body = {}
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v != null) body[k] = k === 'salary' ? Number(v) : v
    })
    try {
      const res = await api(`/api/employees/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      })
      setMsg({ text: res.message || 'Updated', ok: true })
      if (onDone) onDone()
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Update Employee</h2>
        {onDone && (
          <button className="btn btn-ghost btn-sm" type="button" onClick={onDone}>Back to list</button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ maxWidth: 220 }}>
          <label>Employee ID *</label>
          <input
            type="number"
            min="1"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            readOnly={Boolean(employee)}
          />
        </div>
        <p className="subtitle" style={{ marginBottom: 16 }}>Fill only fields you want to change.</p>
        <div className="grid-2">
          {[
            ['first_name', 'First Name', 'text'],
            ['last_name', 'Last Name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'text'],
            ['department', 'Department', 'text'],
            ['designation', 'Designation', 'text'],
            ['salary', 'Salary', 'number'],
            ['date_of_joining', 'Date of Joining', 'date'],
          ].map(([key, label, type]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="">— keep as is —</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary btn-auto" type="submit">Update Employee</button>
        </div>
        <Message text={msg.text} ok={msg.ok} />
      </form>
    </div>
  )
}

export function DeleteEmployee({ token }) {
  const [id, setId] = useState('')
  const [msg, setMsg] = useState({ text: '', ok: false })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!window.confirm(`Delete employee #${id}?`)) return
    setMsg({ text: '', ok: false })
    try {
      const res = await api(`/api/employees/${id}`, { method: 'DELETE', token })
      setMsg({ text: res.message || 'Deleted', ok: true })
      setId('')
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Delete Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ maxWidth: 220 }}>
          <label>Employee ID *</label>
          <input type="number" min="1" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <div className="form-actions">
          <button className="btn btn-danger" type="submit">Delete Employee</button>
        </div>
        <Message text={msg.text} ok={msg.ok} />
      </form>
    </div>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export function ViewEmployees({ token, showActions = false }) {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState({ text: '', ok: false })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const table = useEmployeeTable(rows)

  async function load() {
    setLoading(true)
    setMsg({ text: '', ok: false })
    try {
      const res = await api('/api/employees', { token })
      setRows(res.data || [])
    } catch (err) {
      setMsg({ text: err.message, ok: false })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  async function handleDelete(row) {
    if (!window.confirm(`Delete ${row.first_name} ${row.last_name} (#${row.id})?`)) return
    try {
      const res = await api(`/api/employees/${row.id}`, { method: 'DELETE', token })
      setMsg({ text: res.message || 'Employee deleted', ok: true })
      load()
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  const colSpan = showActions ? 9 : 8

  if (editing) {
    return (
      <UpdateEmployee
        token={token}
        employee={editing}
        onDone={() => {
          setEditing(null)
          load()
        }}
      />
    )
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2 className="panel-title">View Employees</h2>
        <button className="btn btn-ghost btn-sm" type="button" onClick={load}>Refresh</button>
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
              <th>Dept</th><th>Designation</th><th>Salary</th><th>Status</th>
              {showActions && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colSpan} className="empty">Loading…</td></tr>
            ) : table.pageRows.length === 0 ? (
              <tr><td colSpan={colSpan} className="empty">No employees found</td></tr>
            ) : (
              table.pageRows.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.emp_code}</td>
                  <td>{e.first_name} {e.last_name}</td>
                  <td>{e.email}</td>
                  <td>{e.department || '—'}</td>
                  <td>{e.designation || '—'}</td>
                  <td>{e.salary ?? '—'}</td>
                  <td>{e.status}</td>
                  {showActions && (
                    <td>
                      <div className="action-btns">
                        <button
                          type="button"
                          className="icon-btn icon-edit"
                          title="Edit"
                          onClick={() => setEditing(e)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-delete"
                          title="Delete"
                          onClick={() => handleDelete(e)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination page={table.page} setPage={table.setPage} totalPages={table.totalPages} />
      <Message text={msg.text} ok={msg.ok} />
    </div>
  )
}

export function RegisterUsers({ token }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'HR', email: '' })
  const [msg, setMsg] = useState({ text: '', ok: false })

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ text: '', ok: false })
    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        token,
        body: JSON.stringify(form),
      })
      const mailed = form.email
        ? ' Welcome email queued.'
        : ''
      setMsg({ text: `${res.message}: ${res.data.username} (${res.data.role}).${mailed}`, ok: true })
      setForm({ username: '', password: '', role: 'HR', email: '' })
    } catch (err) {
      setMsg({ text: err.message, ok: false })
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Register User (Admin only)</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email (optional — welcome mail)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary btn-auto" type="submit">Register</button>
        </div>
        <Message text={msg.text} ok={msg.ok} />
      </form>
    </div>
  )
}
