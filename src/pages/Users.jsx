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

const ROLE_STYLES = {
  admin:           'bg-purple-100 text-purple-800',
  user:            'bg-blue-100 text-blue-800',
     // ← added
  academy_manager: 'bg-amber-100 text-amber-800',
 
}

const LOGIN_TYPE_STYLES = {
  password: 'bg-neutral-100 text-neutral-700',
  mobile:   'bg-sky-50 text-sky-700',
  google:   'bg-red-50 text-red-700',
  apple:    'bg-gray-100 text-gray-700',
}

// All role options for the dropdown
const ROLE_OPTIONS = [
  { value: '',                label: 'All Roles' },
  { value: 'admin',          label: 'Admin' },
  { value: 'user',           label: 'User' },

  { value: 'academy_manager',label: 'Academy Manager' },

]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const avatarColor = (id = '') =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="bg-neutral-50 rounded-xl px-4 py-3 flex flex-col gap-0.5">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-2xl font-semibold text-black">{value}</span>
    </div>
  )
}

function Badge({ label, className }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${className}`}>
      {label}
    </span>
  )
}

function Avatar({ name, id }) {
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

function UserRow({ user, selected, onSelect, onDelete }) {
  return (
    <tr
      onClick={() => onSelect(user)}
      className={`border-b border-neutral-100 cursor-pointer transition-colors ${
        selected ? 'bg-purple-50' : 'hover:bg-neutral-50'
      }`}
    >
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={user.name} id={user._id} />
          <div>
            <p className="text-sm font-medium text-black leading-none">{user.name}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <Badge
          label={user.role}
          className={ROLE_STYLES[user.role] || 'bg-neutral-100 text-neutral-700'}
        />
      </td>

      {/* Academy — only shown for academy_manager / coach */}
      <td className="px-4 py-3">
        {user.academy?.name ? (
          <div className="flex items-center gap-1.5">
            {user.academy.image && (
              <img
                src={user.academy.image}
                alt={user.academy.name}
                className="w-5 h-5 rounded object-cover border border-neutral-100 flex-shrink-0"
              />
            )}
            <span className="text-xs text-neutral-600 font-medium truncate max-w-[120px]">
              {user.academy.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-300">—</span>
        )}
      </td>

      {/* Login Type */}
      <td className="px-4 py-3">
        <Badge
          label={user.loginType}
          className={LOGIN_TYPE_STYLES[user.loginType] || 'bg-neutral-100 text-neutral-700'}
        />
      </td>

      {/* Online */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot active={user.isOnline} />
          <span className="text-xs text-neutral-500">{user.isOnline ? 'Online' : 'Offline'}</span>
        </div>
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

  const academy = user.academy || {}

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
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold ${avatarColor(user._id)}`}>
            {initials(user.name)}
          </div>
          <p className="text-base font-semibold text-black mt-1">{user.name}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
            <Badge label={user.role} className={ROLE_STYLES[user.role] || 'bg-neutral-100 text-neutral-700'} />
            <Badge label={user.loginType} className={LOGIN_TYPE_STYLES[user.loginType] || 'bg-neutral-100 text-neutral-700'} />
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-300 hover:text-neutral-500 text-lg leading-none">×</button>
      </div>

      {/* Academy block — visible only when role has an academy */}
      {academy.name && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
          {academy.image && (
            <div className="rounded-lg overflow-hidden mb-2" style={{ height: 64 }}>
              <img src={academy.image} alt={academy.name} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xs text-amber-600 font-semibold">{academy.name}</p>
          {academy.description && (
            <p className="text-xs text-neutral-500 mt-0.5">{academy.description}</p>
          )}
          {(academy.openingTime || academy.closingTime) && (
            <p className="text-xs text-neutral-400 mt-1">
              🕐 {academy.openingTime || '—'} – {academy.closingTime || '—'}
            </p>
          )}
        </div>
      )}

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
        { label: 'Mobile',           value: user.mobile },
        { label: 'Current Screen',   value: user.currentScreen },
        { label: 'Mobile Verified',  value: user.isMobileVerified ? 'Yes' : 'No' },
        { label: 'SignUp Completed', value: user.isSignUpCompleted ? 'Yes' : 'No' },
        { label: 'Onboarding Done',  value: user.isOnBoardingCompleted ? 'Yes' : 'No' },
        { label: 'Last Activity',    value: formatDate(user.lastActivity) },
        { label: 'Joined',           value: formatDate(user.createdAt) },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-400 text-xs">{label}</span>
          <span className="font-medium text-black text-xs text-right max-w-[140px] truncate">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Users() {
  const [users,      setUsers]      = useState([])
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')   // ← NEW
  const [selected,   setSelected]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // ── Fetch — re-runs whenever roleFilter changes ──
  const fetchUsers = useCallback(async (role = '') => {
    setLoading(true)
    setError('')
    try {
      // Pass role as a query param when set; your api.js getUsers should
      // accept an optional params object, e.g. getUsers({ role })
      const res = await getUsers(role ? { role } : {})
      // Response shape: { success, data: { total, totalPages, page, limit, data: [] } }
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      setUsers(list)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(roleFilter)
  }, [fetchUsers, roleFilter])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      if (selected?._id === id) setSelected(null)
      await fetchUsers(roleFilter)
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleSelect = (user) => {
    setSelected((prev) => (prev?._id === user._id ? null : user))
  }

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value)
    setSelected(null)   // clear profile panel on role switch
  }

  // Client-side search on top of the already-role-filtered API results
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const academy = u.academy || {}
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.loginType?.toLowerCase().includes(q) ||
      academy.name?.toLowerCase().includes(q)
    )
  })

  // ── Derived Stats ──
  const totalUsers      = users.length
  const onlineCount     = users.filter((u) => u.isOnline).length
  const activeCount     = users.filter((u) => u.isActive).length
  const adminCount      = users.filter((u) => u.role === 'admin').length
  const customerCount   = users.filter((u) => u.role === 'customer').length   // ← added
  const academyMgrCount = users.filter((u) => u.role === 'academy_manager').length
  const coachCount      = users.filter((u) => u.role === 'coach').length

  return (
    <div>
      {/* ── Page Header ─────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Users</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {loading ? '…' : `${totalUsers} total users`}
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

      {/* ── Stats ───────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <StatCard label="Total Users"      value={totalUsers}      />
          <StatCard label="Online Now"       value={onlineCount}     />
          <StatCard label="Active Users"     value={activeCount}     />
          <StatCard label="Admins"           value={adminCount}      />
          <StatCard label="Customers"        value={customerCount}   />
          <StatCard label="Academy Managers" value={academyMgrCount} />
          <StatCard label="Coaches"          value={coachCount}      />
        </div>
      )}

      {/* ── Search + Role Filter ─────────────────── */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, role, academy…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />

        {/* Role Dropdown ← NEW */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="appearance-none border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm text-black bg-white outline-none focus:border-purple-400 cursor-pointer"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">▾</span>
        </div>

        {/* Active filter pill — shown when a role is selected */}
        {roleFilter && (
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
            <span className="text-xs text-purple-700 font-medium capitalize">{roleFilter.replace('_', ' ')}</span>
            <button
              onClick={() => { setRoleFilter(''); setSelected(null) }}
              className="text-purple-400 hover:text-purple-600 text-xs leading-none"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── Main Layout ─────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['User', 'Role', 'Academy', 'Login Type', 'Online', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-neutral-400 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-neutral-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        Loading users…
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-neutral-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <UserRow
                      key={u._id}
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