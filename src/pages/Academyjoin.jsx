// AcademyJoin.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { getAcademyManagers, registerAcademy, deleteUser } from '../api/api'

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
  academy_manager: 'bg-purple-100 text-purple-800',
  coach:           'bg-teal-100 text-teal-800',
  admin:           'bg-rose-100 text-rose-800',
  user:            'bg-blue-100 text-blue-800',
}

const LOGIN_TYPE_STYLES = {
  password: 'bg-neutral-100 text-neutral-700',
  google:   'bg-red-50 text-red-700',
  apple:    'bg-gray-100 text-gray-700',
}

const ROLES = ['academy_manager', 'coach', 'admin', 'user']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const avatarColor = (id = '') =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Shared Sub-components ────────────────────────────────────────────────────

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

function StatCard({ label, value }) {
  return (
    <div className="bg-neutral-50 rounded-xl px-4 py-3 flex flex-col gap-0.5">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-2xl font-semibold text-black">{value}</span>
    </div>
  )
}

function FieldGroup({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TextInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors placeholder:text-neutral-300 ${className}`}
    />
  )
}

// ─── TABLE: UserProfile side panel ───────────────────────────────────────────

function UserProfile({ user, onClose }) {
  if (!user) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] text-neutral-300">
        <div className="text-4xl mb-2">🏫</div>
        <p className="text-sm text-center">Select a manager<br />to view their profile</p>
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col items-center gap-1 w-full">
          {user.image && (
            <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
              <img src={user.image} alt="Academy" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold ${avatarColor(user._id)}`}>
            {initials(user.name)}
          </div>
          <p className="text-base font-semibold text-black mt-1">{user.name}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
            <Badge label={user.role} className={ROLE_STYLES[user.role] || 'bg-neutral-100 text-neutral-700'} />
            {user.loginType && (
              <Badge label={user.loginType} className={LOGIN_TYPE_STYLES[user.loginType] || 'bg-neutral-100 text-neutral-700'} />
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-300 hover:text-neutral-500 text-lg leading-none">×</button>
      </div>

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

      {[
        { label: 'Academy Name',  value: user.academyName },
        { label: 'Description',   value: user.description },
        { label: 'Opening Time',  value: user.openingTime },
        { label: 'Closing Time',  value: user.closingTime },
        { label: 'Mobile',        value: user.mobile },
        { label: 'Last Activity', value: formatDate(user.lastActivity) },
        { label: 'Joined',        value: formatDate(user.createdAt) },
      ].map(({ label, value }) =>
        value ? (
          <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-100 last:border-0">
            <span className="text-neutral-400 text-xs">{label}</span>
            <span className="font-medium text-black text-xs text-right max-w-[140px] truncate">{value}</span>
          </div>
        ) : null
      )}
    </div>
  )
}

// ─── TABLE: UserRow ───────────────────────────────────────────────────────────

function UserRow({ user, selected, onSelect, onDelete }) {
  return (
    <tr
      onClick={() => onSelect(user)}
      className={`border-b border-neutral-100 cursor-pointer transition-colors ${
        selected ? 'bg-purple-50' : 'hover:bg-neutral-50'
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={user.name} id={user._id} />
          <div>
            <p className="text-sm font-medium text-black leading-none">{user.name}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 max-w-[140px]">
        <p className="text-xs font-medium text-neutral-700 truncate">{user.academyName || '—'}</p>
        {user.description && (
          <p className="text-xs text-neutral-400 truncate mt-0.5">{user.description}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {user.openingTime && user.closingTime
          ? `${user.openingTime} – ${user.closingTime}`
          : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">{user.mobile || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot active={user.isOnline} />
          <span className="text-xs text-neutral-500">{user.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot active={user.isActive} />
          <span className="text-xs text-neutral-500">{user.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {user.image
          ? <img src={user.image} alt="academy" className="w-8 h-8 rounded-md object-cover border border-neutral-200" />
          : <span className="text-neutral-300 text-xs">—</span>
        }
      </td>
      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>
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

// ─── TAB 1: Academy Managers Table ───────────────────────────────────────────

function AcademyManagersTab() {
  const [users,    setUsers]    = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAcademyManagers()
      const list = Array.isArray(res.data) ? res.data : [res.data]
      setUsers(list)
    } catch (err) {
      setError(err.message || 'Failed to load academy managers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      if (selected?._id === id) setSelected(null)
      await fetchUsers()
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleSelect = (user) =>
    setSelected((prev) => (prev?._id === user._id ? null : user))

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.academyName?.toLowerCase().includes(q) ||
      u.mobile?.toLowerCase().includes(q)
    )
  })

  const totalUsers    = users.length
  const onlineCount   = users.filter((u) => u.isOnline).length
  const activeCount   = users.filter((u) => u.isActive).length
  const verifiedCount = users.filter((u) => u.isEmailVerified).length

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Managers"  value={totalUsers}    />
          <StatCard label="Online Now"      value={onlineCount}   />
          <StatCard label="Active"          value={activeCount}   />
          <StatCard label="Email Verified"  value={verifiedCount} />
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, academy…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />
      </div>

      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Manager', 'Academy', 'Hours', 'Mobile', 'Online', 'Status', 'Image', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-neutral-400 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-neutral-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        Loading managers…
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-neutral-400">
                      No academy managers found
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

        {/* Profile Panel — desktop */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <UserProfile user={selected} onClose={() => setSelected(null)} />
        </div>
      </div>

      {/* Profile Panel — mobile */}
      {selected && (
        <div className="mt-4 lg:hidden">
          <UserProfile user={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}

// ─── TAB 2: Register Academy Form ────────────────────────────────────────────

function ImageUploadBox({ preview, fileName, onFileChange, onRemove }) {
  const fileRef = useRef(null)
  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden
          ${preview ? 'border-purple-300 bg-purple-50' : 'border-neutral-200 bg-neutral-50 hover:border-purple-300 hover:bg-purple-50'}`}
        style={{ height: 160 }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Academy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Change image</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-xs text-neutral-400">Click to upload academy image</p>
            <p className="text-xs text-neutral-300 mt-0.5">PNG, JPG up to 10MB</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
      {preview && (
        <button type="button" onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-600 transition-colors self-start">
          Remove image
        </button>
      )}
      {fileName && <p className="text-xs text-neutral-400 truncate">📎 {fileName}</p>}
    </div>
  )
}

function LivePreview({ form, imagePreview }) {
  const hasName = form.name?.trim()
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-4">
      <p className="text-xs font-medium text-neutral-400 mb-4 uppercase tracking-wide">Live Preview</p>

      <div className="rounded-xl overflow-hidden bg-neutral-100 mb-4" style={{ height: 100 }}>
        {imagePreview
          ? <img src={imagePreview} alt="Academy" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-neutral-300 text-xs">No image yet</span>
            </div>
        }
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {hasName ? initials(form.name) : '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black truncate">
            {form.name || <span className="text-neutral-300">Full name</span>}
          </p>
          <p className="text-xs text-neutral-400 truncate">
            {form.email || <span className="text-neutral-300">Email address</span>}
          </p>
        </div>
      </div>

      <hr className="border-neutral-100 mb-3" />

      {[
        { label: 'Academy',     value: form.academyName },
        { label: 'Description', value: form.description },
        { label: 'Mobile',      value: form.mobile },
        { label: 'Role',        value: form.role },
        { label: 'Opens',       value: form.openingTime },
        { label: 'Closes',      value: form.closingTime },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-400">{label}</span>
          <span className={`font-medium text-right max-w-[140px] truncate ${value ? 'text-black' : 'text-neutral-300'}`}>
            {value || '—'}
          </span>
        </div>
      ))}

      {form.role && (
        <div className="mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_STYLES[form.role] || 'bg-neutral-100 text-neutral-700'}`}>
            {form.role}
          </span>
        </div>
      )}
    </div>
  )
}

const EMPTY_FORM = {
  name: '', email: '', mobile: '', password: '',
  role: 'academy_manager', academyName: '', description: '',
  openingTime: '', closingTime: '',
}

function RegisterAcademyTab({ onSuccess }) {
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState('')
  const [apiError,     setApiError]     = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageRemove = () => { setImageFile(null); setImagePreview('') }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name        = 'Name is required'
    if (!form.email.trim())       e.email       = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.mobile.trim())      e.mobile      = 'Mobile number is required'
    if (!form.password.trim())    e.password    = 'Password is required'
    else if (form.password.length < 6)          e.password = 'Min 6 characters'
    if (!form.role)               e.role        = 'Role is required'
    if (!form.academyName.trim()) e.academyName = 'Academy name is required'
    if (!form.openingTime.trim()) e.openingTime = 'Opening time is required'
    if (!form.closingTime.trim()) e.closingTime = 'Closing time is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccess('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => formData.append(key, val))
      if (imageFile) formData.append('image', imageFile)
      await registerAcademy(formData)
      setSuccess('Academy registered successfully!')
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview('')
      setErrors({})
      onSuccess?.()
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setErrors({})
    setApiError('')
    setSuccess('')
  }

  return (
    <div>
      {success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex justify-between">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">×</button>
        </div>
      )}
      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Form */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} noValidate>

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Full Name *" error={errors.name}>
                  <TextInput name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Devashish Sharma"
                    className={errors.name ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Email Address *" error={errors.email}>
                  <TextInput name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="e.g. myacademy@gmail.com"
                    className={errors.email ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Mobile Number *" error={errors.mobile}>
                  <TextInput name="mobile" type="tel" value={form.mobile} onChange={handleChange}
                    placeholder="e.g. 8889524382"
                    className={errors.mobile ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Password *" error={errors.password}>
                  <TextInput name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={errors.password ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Role *" error={errors.role}>
                  <select name="role" value={form.role} onChange={handleChange}
                    className={`border rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors bg-white
                      ${errors.role ? 'border-red-300' : 'border-neutral-200'}`}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FieldGroup>
              </div>
            </div>

            {/* Academy Details */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Academy Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Academy Name *" error={errors.academyName}>
                  <TextInput name="academyName" value={form.academyName} onChange={handleChange}
                    placeholder="e.g. Nyra Sports Academy"
                    className={errors.academyName ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Description" error={errors.description}>
                  <TextInput name="description" value={form.description} onChange={handleChange}
                    placeholder="e.g. Sports all" />
                </FieldGroup>

                <FieldGroup label="Opening Time *" error={errors.openingTime}>
                  <TextInput name="openingTime" value={form.openingTime} onChange={handleChange}
                    placeholder="e.g. 06:00 AM"
                    className={errors.openingTime ? 'border-red-300' : ''} />
                </FieldGroup>

                <FieldGroup label="Closing Time *" error={errors.closingTime}>
                  <TextInput name="closingTime" value={form.closingTime} onChange={handleChange}
                    placeholder="e.g. 10:00 PM"
                    className={errors.closingTime ? 'border-red-300' : ''} />
                </FieldGroup>
              </div>
            </div>

            {/* Academy Image */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Academy Image</p>
              <ImageUploadBox
                preview={imagePreview}
                fileName={imageFile?.name}
                onFileChange={handleImageChange}
                onRemove={handleImageRemove}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? 'Registering…' : 'Register Academy'}
              </button>
              <button type="button" onClick={handleReset}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview — desktop */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <LivePreview form={form} imagePreview={imagePreview} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AcademyJoin() {
  const [activeTab, setActiveTab] = useState('managers')
  // Bumping this key forces AcademyManagersTab to re-mount and re-fetch after a new registration
  const [tableKey,  setTableKey]  = useState(0)

  const tabs = [
    { id: 'managers', label: 'Academy Managers' },
    { id: 'register', label: '+ Register Academy' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Academies</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage academy managers and register new academies
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'managers'
        ? <AcademyManagersTab key={tableKey} />
        : <RegisterAcademyTab
            onSuccess={() => {
              setTableKey((k) => k + 1) // refresh table data
              setActiveTab('managers')  // auto-switch back to table
            }}
          />
      }
    </div>
  )
}