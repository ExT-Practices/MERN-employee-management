export function TableToolbar({
  search, setSearch,
  status, setStatus,
  department, setDepartment,
  departments,
  size, setSize,
  filteredCount,
  totalCount,
}) {
  return (
    <div className="table-toolbar">
      <input
        className="table-search"
        type="search"
        placeholder="Search name, email, code, dept..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
        <option value={5}>Show 5 rows</option>
        <option value={10}>Show 10 rows</option>
        <option value={20}>Show 20 rows</option>
      </select>
      <span className="table-count">Showing {filteredCount} of {totalCount}</span>
    </div>
  )
}

export function TablePagination({ page, setPage, totalPages }) {
  const pages = []
  for (let i = 1; i <= totalPages; i += 1) pages.push(i)

  return (
    <div className="pager">
      <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={`pager-btn ${n === page ? 'active' : ''}`}
          onClick={() => setPage(n)}
        >
          {n}
        </button>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </button>
      <span className="table-count">Page {page} of {totalPages}</span>
    </div>
  )
}
