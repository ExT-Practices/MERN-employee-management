export async function api(path, { token, ...options } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    localStorage.removeItem('emp_token')
    localStorage.removeItem('emp_user')
    window.dispatchEvent(new Event('auth-expired'))
  }

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}
