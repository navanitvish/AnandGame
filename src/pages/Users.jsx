// Users.jsx
import { useState, useEffect, useCallback } from 'react'
import { getUsers, deleteUser } from '../api/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-violet-100 text-violet-800',
  'bg-teal-100 text-teal-800',
  'bg-rose-100 text-rose-800',
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-green-100 text-green-800',
]

const PAGE_SIZE = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const avatarColor = (id = '') =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const formatDob = (dob) => {
  if (!dob) return '—'
  const [y, m, d] = dob.split('-')
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, id, image }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-neutral-100"
      />
    )
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(id)}`}>
      {initials(name)}
    </div>
  )
}

function StatusDot({ active }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-neutral-300'}`} />
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end   = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('...')

    pages.push(totalPages)

    return pages
  }

  const btnBase   = 'min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center'
  const activeCls = 'bg-purple-600 text-white'
  const normalCls = 'text-neutral-500 hover:bg-neutral-100'
  const arrowCls  = 'text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      {/* Left — info */}
      <p className="text-xs text-neutral-400">
        Page <span className="font-medium text-neutral-600">{currentPage}</span> of{' '}
        <span className="font-medium text-neutral-600">{totalPages}</span>
      </p>

      {/* Right — controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${arrowCls}`}
        >
          ‹
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="text-xs text-neutral-300 px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btnBase} ${currentPage === p ? activeCls : normalCls}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${arrowCls}`}
        >
          ›
        </button>
      </div>
    </div>
  )
}

function UserRow({ user, index, selected, onSelect, onDelete }) {
  return (
    <tr
      onClick={() => onSelect(user)}
      className={`border-b border-neutral-100 cursor-pointer transition-colors ${
        selected ? 'bg-purple-50' : 'hover:bg-neutral-50'
      }`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-xs text-neutral-400 font-medium">{index}</td>

      {/* Image */}
      <td className="px-4 py-3">
        <Avatar name={user.name} id={user._id} image={user.image} />
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm capitalize font-medium text-black leading-none">{user.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">
  {user.mobile ? user.mobile : <span className="text-neutral-300">—</span>}
</td>


      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot active={user.isActive} />
          <span className="text-xs text-neutral-500">{user.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-xs text-neutral-400">{formatDate(user.createdAt)}</td>

      {/* Delete */}
      <td className="px-4 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(user._id) }}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

function UserProfile({ user, onClose }) {
  if (!user) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] text-neutral-300">
        <div className="text-4xl mb-2">👤</div>
        <p className="text-sm text-center">Select a user<br />to view their profile</p>
      </div>
    )
  }

  const boolBadge = (val) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
      {val ? 'Yes' : 'No'}
    </span>
  )

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col items-center gap-1 w-full">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border border-neutral-100"
            />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold ${avatarColor(user._id)}`}>
              {initials(user.name)}
            </div>
          )}
          <p className="text-base font-semibold text-black mt-1">{user.name}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
          {user.mobile && (
            <p className="text-xs text-neutral-500 mt-0.5">📱 {user.mobile}</p>
          )}
        </div>
        <button onClick={onClose} className="text-neutral-300 hover:text-neutral-500 text-lg leading-none">×</button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Online',         value: user.isOnline },
          { label: 'Active',         value: user.isActive },
          { label: 'Logged In',      value: user.isLoggedIn },
          { label: 'Email Verified', value: user.isEmailVerified },
        ].map(({ label, value }) => (
          <div key={label} className="bg-neutral-50 rounded-lg p-3">
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            {boolBadge(value)}
          </div>
        ))}
      </div>

      <hr className="border-neutral-100 mb-3" />

      {/* Details */}
      {[
        { label: 'Address',          value: user.address },
        { label: 'Date of Birth',    value: formatDob(user.dob) },
        { label: 'Current Screen',   value: user.currentScreen },
        { label: 'Login Type',       value: user.loginType },
        { label: 'Mobile Verified',  value: user.isMobileVerified  ? 'Yes' : 'No' },
        { label: 'SignUp Completed', value: user.isSignUpCompleted ? 'Yes' : 'No' },
        { label: 'Onboarding Done',  value: user.isOnBoardingCompleted ? 'Yes' : 'No' },
        { label: 'Last Activity',    value: formatDate(user.lastActivity) },
        { label: 'Joined',           value: formatDate(user.createdAt) },
        { label: 'Last Updated',     value: formatDate(user.updatedAt) },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center py-1.5 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-400 text-xs">{label}</span>
          <span className="font-medium text-black text-xs text-right max-w-[150px] truncate">{value || '—'}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Users() {
  const [users,       setUsers]       = useState([])
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getUsers({ role: 'user' })
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      setUsers(list)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      if (selected?._id === id) setSelected(null)
      await fetchUsers()
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleSelect = (user) => {
    setSelected((prev) => (prev?._id === user._id ? null : user))
  }

  // Reset to page 1 when search changes
  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  // ── Derived: filter → paginate ──
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q)   ||
      u.email?.toLowerCase().includes(q)  ||
      u.mobile?.toLowerCase().includes(q) ||
      u.address?.toLowerCase().includes(q)
    )
  })

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated   = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
     currentPage      * PAGE_SIZE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSelected(null)   // clear profile on page switch
  }

  return (
    <div>
      {/* ── Page Header ─────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Users</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {loading ? '…' : `${filtered.length} users${search ? ' found' : ' total'}`}
          </p>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* ── Search ───────────────────────────────── */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, mobile, address…"
          value={search}
          onChange={handleSearch}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />
      </div>

      {/* ── Main Layout ─────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* Table + Pagination */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['S.No', 'Image', 'User','Mobile',  'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-neutral-400 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        Loading users…
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginated.map((u, i) => (
                    <UserRow
                      key={u._id}
                      index={(currentPage - 1) * PAGE_SIZE + i + 1}
                      user={u}
                      selected={selected?._id === u._id}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — outside the table box */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Profile panel */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <UserProfile user={selected} onClose={() => setSelected(null)} />
        </div>
      </div>

      {/* Mobile profile */}
      {selected && (
        <div className="mt-4 lg:hidden">
          <UserProfile user={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}