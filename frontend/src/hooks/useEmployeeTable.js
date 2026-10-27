import { useEffect, useMemo, useState } from 'react'

export function useEmployeeTable(rows, pageSize = 5) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)

  const departments = useMemo(() => (
    [...new Set(rows.map((r) => r.department).filter(Boolean))].sort()
  ), [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (status && r.status !== status) return false
      if (department && r.department !== department) return false
      if (!q) return true
      const hay = [
        r.id, r.emp_code, r.first_name, r.last_name, r.email,
        r.department, r.designation, r.phone, r.status,
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [rows, search, status, department])

  const totalPages = Math.max(1, Math.ceil(filtered.length / size) || 1)
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * size, currentPage * size)

  useEffect(() => {
    setPage(1)
  }, [search, status, department, size])

  return {
    search, setSearch,
    status, setStatus,
    department, setDepartment,
    departments,
    page: currentPage, setPage,
    size, setSize,
    totalPages,
    filteredCount: filtered.length,
    pageRows,
  }
}
