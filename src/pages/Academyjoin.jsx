// AcademyJoin.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { getAcademyManagers, registerAcademy, createLocation, deleteUser, getLocation } from '../api/api'
import api from '../api/api'   // ← for updateUser (PUT /users/update?userId=...)

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-violet-100 text-violet-800', 'bg-teal-100 text-teal-800',
  'bg-rose-100 text-rose-800',     'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',   'bg-green-100 text-green-800',
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

// ─── Update User API ──────────────────────────────────────────────────────────
/**
 * PUT /users/update?userId=<id>
 * Body: FormData or JSON with fields to update
 */
const updateUser = (userId, data) =>
  api.put(`/users/update`, data, { params: { userId } })

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials    = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
const avatarColor = (id = '')   => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]
const formatDate  = (iso)       => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const normalizeUser = (raw) => ({
  ...raw,
  academyId:    raw.academy?._id         || raw.academyId    || '',
  academyName:  raw.academy?.name        || raw.academyName  || '',
  description:  raw.academy?.description || raw.description  || '',
  openingTime:  raw.academy?.openingTime || raw.openingTime  || '',
  closingTime:  raw.academy?.closingTime || raw.closingTime  || '',
  isSubscribed: raw.academy?.isSubscribed ?? false,
  academy:      raw.academy || null,
})

// ─── Shared Sub-components ────────────────────────────────────────────────────
function Badge({ label, className }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${className}`}>{label}</span>
}
function Avatar({ name, id }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(id)}`}>
      {initials(name)}
    </div>
  )
}
function StatusDot({ active }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-neutral-300'}`} />
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
function ErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 ml-3">×</button>
    </div>
  )
}

// ─── VIEW MODAL ───────────────────────────────────────────────────────────────
function ViewModal({ user, location, onClose }) {
  if (!user) return null
  const boolBadge = (val) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
      {val ? 'Yes' : 'No'}
    </span>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <p className="text-sm font-semibold text-black">Manager Details</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors text-lg">×</button>
        </div>
        <div className="p-6">
          {user.image && (
            <div className="w-full h-36 rounded-xl overflow-hidden mb-5 bg-neutral-100">
              <img src={user.image} alt="Academy" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 ${avatarColor(user._id)}`}>
              {initials(user.name)}
            </div>
            <div>
              <p className="text-base font-semibold text-black">{user.name}</p>
              <p className="text-xs text-neutral-400">{user.email}</p>
              <p className="text-xs text-neutral-400">{user.mobile}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <Badge label={user.role} className={ROLE_STYLES[user.role] || 'bg-neutral-100 text-neutral-700'} />
                {user.loginType && <Badge label={user.loginType} className={LOGIN_TYPE_STYLES[user.loginType] || 'bg-neutral-100 text-neutral-700'} />}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Online',          value: user.isOnline },
              { label: 'Active',          value: user.isActive },
              { label: 'Logged In',       value: user.isLoggedIn },
              { label: 'Email Verified',  value: user.isEmailVerified },
              { label: 'Mobile Verified', value: user.isMobileVerified },
              { label: 'Sign Up Done',    value: user.isSignUpCompleted },
              { label: 'Onboarding',      value: user.isOnBoardingCompleted },
              { label: 'Subscribed',      value: user.isSubscribed },
            ].map(({ label, value }) => (
              <div key={label} className="bg-neutral-50 rounded-lg p-2.5">
                <p className="text-xs text-neutral-400 mb-1">{label}</p>
                {boolBadge(value)}
              </div>
            ))}
          </div>
          <hr className="border-neutral-100 mb-4" />
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">User Info</p>
          <div className="space-y-0 mb-5">
            {[
              { label: 'User ID',        value: user._id },
              { label: 'Current Screen', value: user.currentScreen },
              { label: 'Last Activity',  value: formatDate(user.lastActivity) },
              { label: 'Joined',         value: formatDate(user.createdAt) },
              { label: 'Updated',        value: formatDate(user.updatedAt) },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-50">
                <span className="text-neutral-400 text-xs">{label}</span>
                <span className="font-medium text-black text-xs text-right max-w-[200px] truncate">{value}</span>
              </div>
            ) : null)}
          </div>
          <hr className="border-neutral-100 mb-4" />
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Academy Info</p>
          <div className="space-y-0 mb-5">
            {[
              { label: 'Academy ID',     value: user.academyId },
              { label: 'Academy Name',   value: user.academyName },
              { label: 'Description',    value: user.description },
              { label: 'Opening Time',   value: user.openingTime },
              { label: 'Closing Time',   value: user.closingTime },
              { label: 'Academy Email',  value: user.academy?.email },
              { label: 'Academy Mobile', value: user.academy?.mobile },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between items-start text-sm py-1.5 border-b border-neutral-50">
                <span className="text-neutral-400 text-xs flex-shrink-0">{label}</span>
                <span className="font-medium text-black text-xs text-right max-w-[220px] break-words">{value}</span>
              </div>
            ) : null)}
          </div>

          {/* ── Location Info ── */}
          {location && (
            <>
              <hr className="border-neutral-100 mb-4" />
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">📍 Location Info</p>
              <div className="space-y-0">
                {[
                  { label: 'Location ID',        value: location._id },
                  { label: 'Name',               value: location.name },
                  { label: 'Building No.',        value: location.buildingNumber },
                  { label: 'Address',             value: location.address },
                  { label: 'Area',                value: location.area },
                  { label: 'City',                value: location.city },
                  { label: 'District',            value: location.district },
                  { label: 'State',               value: location.state },
                  { label: 'Country',             value: location.country },
                  { label: 'Zipcode',             value: location.zipcode },
                  { label: 'Formatted Address',   value: location.formattedAddress },
                  { label: 'Coordinates',         value: location.coordinates?.length === 2 ? `${location.coordinates[0]}, ${location.coordinates[1]}` : null },
                  { label: 'Venue Address',       value: location.isVenueAddress != null ? (location.isVenueAddress ? 'Yes' : 'No') : null },
                  { label: 'Default',             value: location.isDefault != null ? (location.isDefault ? 'Yes' : 'No') : null },
                  { label: 'Active',              value: location.isActive != null ? (location.isActive ? 'Yes' : 'No') : null },
                  { label: 'Created',             value: formatDate(location.createdAt) },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between items-start text-sm py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 text-xs flex-shrink-0">{label}</span>
                    <span className="font-medium text-black text-xs text-right max-w-[220px] break-words">{value}</span>
                  </div>
                ) : null)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSaved }) {
  if (!user) return null

  const [form,        setForm]        = useState({
    name:         user.name        || '',
    email:        user.email       || '',
    mobile:       user.mobile      || '',
    academyName:  user.academyName || '',
    description:  user.description || '',
    openingTime:  user.openingTime || '',
    closingTime:  user.closingTime || '',
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(user.image || '')
  const [loading,      setLoading]      = useState(false)
  const [apiError,     setApiError]     = useState('')
  const fileRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0]
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      // Build FormData so image upload works alongside text fields
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      if (imageFile) fd.append('image', imageFile)

      await updateUser(user._id, fd)
      onSaved()
      onClose()
    } catch (err) {
      setApiError(err.message || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor(user._id)}`}>
              {initials(user.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-black">Edit Manager</p>
              <p className="text-xs text-neutral-400 font-mono">{user._id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <ErrorBanner message={apiError} onClose={() => setApiError('')} />

          {/* Image */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Profile / Academy Image</p>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 hover:border-purple-300 cursor-pointer overflow-hidden bg-neutral-50 flex items-center justify-center flex-shrink-0 transition-colors relative group">
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-2xl text-neutral-300">+</span>}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <span className="text-white text-[10px] font-medium">Change</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <div className="text-xs text-neutral-400">
                <p className="font-medium text-neutral-600 mb-1">Upload new image</p>
                <p>PNG, JPG up to 10MB</p>
                {imageFile && <p className="text-purple-500 mt-1 truncate max-w-[180px]">📎 {imageFile.name}</p>}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Personal Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldGroup label="Full Name">
                <TextInput name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              </FieldGroup>
              <FieldGroup label="Email">
                <TextInput name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
              </FieldGroup>
              <FieldGroup label="Mobile">
                <TextInput name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="Mobile" />
              </FieldGroup>
            </div>
          </div>

          {/* Academy Info */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Academy Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldGroup label="Academy Name">
                <TextInput name="academyName" value={form.academyName} onChange={handleChange} placeholder="Academy name" />
              </FieldGroup>
              <FieldGroup label="Description">
                <TextInput name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
              </FieldGroup>
              <FieldGroup label="Opening Time">
                <TextInput name="openingTime" value={form.openingTime} onChange={handleChange} placeholder="e.g. 06:00 AM" />
              </FieldGroup>
              <FieldGroup label="Closing Time">
                <TextInput name="closingTime" value={form.closingTime} onChange={handleChange} placeholder="e.g. 10:00 PM" />
              </FieldGroup>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteConfirmModal({ user, onConfirm, onCancel, loading }) {
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-500 text-lg">🗑️</span>
          </div>
          <div>
            <p className="text-sm font-bold text-black">Delete Manager</p>
            <p className="text-xs text-neutral-400">This action cannot be undone</p>
          </div>
        </div>
        <div className="bg-neutral-50 rounded-xl p-3 mb-5 flex items-center gap-3">
          <Avatar name={user.name} id={user._id} />
          <div>
            <p className="text-sm font-medium text-black">{user.name}</p>
            <p className="text-xs text-neutral-400">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
          <button onClick={onCancel}
            className="flex-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── UserRow ─────────────────────────────────────────────────────────────────
function UserRow({ user, index, location, locLoading, onDelete, onView, onEdit }) {
  const loc = location

  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

      {/* S.No */}
      <td className="px-4 py-3 text-neutral-400 text-xs">{index + 1}</td>

      {/* Manager */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={user.name} id={user._id} />
          <div>
            <p className="text-sm capitalize font-medium text-black leading-none">{user.name}</p>
            {/* <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p> */}
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3 text-xs text-neutral-500">
        <div>
          <p>{user.mobile || '—'}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
        </div>
      </td>

      {/* Academy */}
      <td className="px-4 py-3 max-w-[160px]">
        <p className="text-xs font-medium text-neutral-700 truncate">{user.academyName || '—'}</p>
        {user.description && <p className="text-xs text-neutral-400 truncate mt-0.5">{user.description}</p>}
      </td>

      {/* Hours */}
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {user.openingTime && user.closingTime ? `${user.openingTime} – ${user.closingTime}` : '—'}
      </td>

      {/* Status */}
      {/* <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot active={user.isActive} />
          <span className="text-xs text-neutral-500">{user.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </td> */}

      {/* Image */}
      <td className="px-4 py-3">
        {user.image
          ? <img src={user.image} alt="academy" className="w-8 h-8 rounded-md object-cover border border-neutral-200" />
          : <span className="text-neutral-300 text-xs">—</span>}
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>

   

      {/* ── Location columns ── */}
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {locLoading ? <span className="text-neutral-300">…</span> : loc?.city || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {locLoading ? <span className="text-neutral-300">…</span> : loc?.district || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {locLoading ? <span className="text-neutral-300">…</span> : loc?.state || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {locLoading ? <span className="text-neutral-300">…</span> : loc?.zipcode || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 max-w-[200px]">
        {locLoading
          ? <span className="text-neutral-300">…</span>
          : loc?.formattedAddress
            ? <span className="truncate block max-w-[200px]" title={loc.formattedAddress}>{loc.formattedAddress}</span>
            : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap font-mono">
        {locLoading
          ? <span className="text-neutral-300">…</span>
          : loc?.coordinates?.length === 2
            ? `${loc.coordinates[0]?.toFixed(4)}, ${loc.coordinates[1]?.toFixed(4)}`
            : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(user)}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg whitespace-nowrap"
          >
            View
          </button>
          <button
            onClick={() => onEdit(user)}
            className="text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg whitespace-nowrap"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(user)}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg whitespace-nowrap"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── TAB 1: Academy Managers Table ───────────────────────────────────────────
function AcademyManagersTab() {
  const [users,           setUsers]           = useState([])
  const [locations,       setLocations]       = useState({})
  const [locLoading,      setLocLoading]      = useState({})
  const [search,          setSearch]          = useState('')
  const [viewUser,        setViewUser]        = useState(null)
  const [editUser,        setEditUser]        = useState(null)
  const [deleteTarget,    setDeleteTarget]    = useState(null)
  const [deleteLoading,   setDeleteLoading]   = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await getAcademyManagers()
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data) ? res.data
        : []
      const normalized = rawList.map(normalizeUser)
      setUsers(normalized)
      return normalized
    } catch (err) {
      setError(err.message || 'Failed to load academy managers')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLocations = useCallback(async (userList) => {
    if (!userList.length) return
    const initLoading = {}
    userList.forEach((u) => { initLoading[u._id] = true })
    setLocLoading(initLoading)

    const results = await Promise.allSettled(
      userList.map((u) =>
        getLocation(u._id)
          .then((res) => {
            const list = Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
              ? res
              : []
            const loc = list.find((l) => l.isActive && !l.isDeleted) || list[0] || null
            return { userId: u._id, loc }
          })
          .catch(() => ({ userId: u._id, loc: null }))
      )
    )

    const locMap = {}
    const doneLoading = {}
    results.forEach((r) => {
      const { userId, loc } = r.status === 'fulfilled' ? r.value : { userId: null, loc: null }
      if (userId) {
        locMap[userId]      = loc
        doneLoading[userId] = false
      }
    })
    setLocations((prev) => ({ ...prev, ...locMap }))
    setLocLoading((prev) => ({ ...prev, ...doneLoading }))
  }, [])

  useEffect(() => {
    fetchUsers().then((normalized) => {
      if (normalized.length) fetchLocations(normalized)
    })
  }, [fetchUsers, fetchLocations])

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget._id)
      if (viewUser?._id === deleteTarget._id) setViewUser(null)
      if (editUser?._id === deleteTarget._id) setEditUser(null)
      setDeleteTarget(null)
      const normalized = await fetchUsers()
      if (normalized.length) fetchLocations(normalized)
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── After edit saved ────────────────────────────────────────────────────────
  const handleEditSaved = () => {
    fetchUsers().then((normalized) => {
      if (normalized.length) fetchLocations(normalized)
    })
  }

  const filtered = users.filter((u) => {
    const q   = search.toLowerCase()
    const loc = locations[u._id]
    return (
      u.name?.toLowerCase().includes(q)        ||
      u.email?.toLowerCase().includes(q)       ||
      u.academyName?.toLowerCase().includes(q) ||
      u.mobile?.toLowerCase().includes(q)      ||
      u.role?.toLowerCase().includes(q)        ||
      loc?.city?.toLowerCase().includes(q)     ||
      loc?.district?.toLowerCase().includes(q) ||
      loc?.state?.toLowerCase().includes(q)    ||
      loc?.formattedAddress?.toLowerCase().includes(q)
    )
  })

  const TABLE_HEADERS = [
    'S.No', 'Manager', 'Contact', 'Academy', 'Hours',
    'Image', 'Joined', 
    'City', 'District', 'State', 'Zipcode', 'Formatted Address', 'Coordinates',
    'Actions',
  ]

  return (
    <div>
      {/* Modals */}
      {viewUser && (
        <ViewModal
          user={viewUser}
          location={locations[viewUser._id] ?? null}
          onClose={() => setViewUser(null)}
        />
      )}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleEditSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <ErrorBanner message={error} onClose={() => setError('')} />

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Managers" value={users.length} />
          <StatCard label="Active"         value={users.filter(u => u.isActive).length} />
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, academy, role, city, state…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />
      </div>

      {/* Full-width table — no side panel */}
      <div style={{ overflowX: 'auto' }}>
        <div className="bg-white rounded-xl border border-neutral-200" style={{ minWidth: 1700 }}>
          <table className="text-sm w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-neutral-400 font-medium text-xs whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="text-center py-12 text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      Loading managers…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="text-center py-12 text-neutral-400">
                    No academy managers found
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    index={i}
                    location={locations[u._id] ?? null}
                    locLoading={locLoading[u._id] ?? false}
                    onView={setViewUser}
                    onEdit={setEditUser}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Image Upload Box ─────────────────────────────────────────────────────────
function ImageUploadBox({ preview, fileName, onFileChange, onRemove }) {
  const fileRef = useRef(null)
  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${preview ? 'border-purple-300 bg-purple-50' : 'border-neutral-200 bg-neutral-50 hover:border-purple-300 hover:bg-purple-50'}`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-xs text-neutral-400">Click to upload image</p>
            <p className="text-xs text-neutral-300 mt-0.5">PNG, JPG up to 10MB</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
      {preview && (
        <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 transition-colors self-start">
          Remove image
        </button>
      )}
      {fileName && <p className="text-xs text-neutral-400 truncate">📎 {fileName}</p>}
    </div>
  )
}

// ─── Banners Upload Box ───────────────────────────────────────────────────────
function BannersUploadBox({ banners, onAdd, onRemove }) {
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    onAdd(files)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      {banners.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {banners.map((b, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50"
              style={{ height: 90 }}
            >
              <img src={b.preview} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-base font-bold hover:bg-red-600 transition-colors shadow"
                >
                  ×
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/30">
                <p className="text-white text-[9px] truncate leading-tight">{b.file.name}</p>
              </div>
              <div className="absolute top-1.5 left-1.5">
                <span className="text-[9px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                  {i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
        style={{ height: 100 }}
      >
        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-xs text-neutral-400 font-medium">Click to add banners</p>
        <p className="text-xs text-neutral-300 mt-0.5">PNG, JPG — select multiple at once</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {banners.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {banners.length} banner{banners.length !== 1 ? 's' : ''} selected
          </p>
          <button
            type="button"
            onClick={() => { for (let i = banners.length - 1; i >= 0; i--) onRemove(i) }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Remove all
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex items-center gap-2">
        {currentStep === 'register' ? (
          <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <span className={`text-xs font-medium ${currentStep === 'register' ? 'text-black' : 'text-emerald-600'}`}>
          Register Academy
        </span>
      </div>
      <div className="h-px w-10 bg-neutral-300" />
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep === 'location' ? 'bg-black' : 'bg-neutral-200'}`}>
          <span className={`text-xs font-bold ${currentStep === 'location' ? 'text-white' : 'text-neutral-400'}`}>2</span>
        </div>
        <span className={`text-xs font-medium ${currentStep === 'location' ? 'text-black' : 'text-neutral-400'}`}>
          Create Location
        </span>
      </div>
    </div>
  )
}

// ─── STEP 2: Create Location ──────────────────────────────────────────────────
const EMPTY_LOCATION = {
  coordinates: ['', ''],
  isVenueAddress: true,
  buildingNumber: '', name: '', address: '', city: '',
  district: '', zipcode: '', state: '', area: '', country: '',
}

function CreateLocationStep({ registeredAcademy, onSuccess, onSkip }) {
  const userId      = registeredAcademy?.user?._id     || ''
  const academyName = registeredAcademy?.academy?.name || ''
  const userName    = registeredAcademy?.user?.name    || ''

  const [location,       setLocation]       = useState(EMPTY_LOCATION)
  const [useCoords,      setUseCoords]      = useState(true)
  const [locationErrors, setLocationErrors] = useState({})
  const [loading,        setLoading]        = useState(false)
  const [apiError,       setApiError]       = useState('')

  const [logoFile,    setLogoFile]    = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerFiles, setBannerFiles] = useState([])

  console.log('[CreateLocationStep] userId (user._id):', userId, '| registeredAcademy:', registeredAcademy)

  const handleChange       = (field, value) => setLocation((prev) => ({ ...prev, [field]: value }))
  const handleCoordsChange = (index, value) => {
    const coords = [...(location.coordinates || ['', ''])]
    coords[index] = value
    setLocation((prev) => ({ ...prev, coordinates: coords }))
  }

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0]
    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
  }
  const handleLogoRemove = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(null); setLogoPreview('')
  }

  const handleAddBanners = (files) => {
    const newEntries = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))
    setBannerFiles((prev) => [...prev, ...newEntries])
  }
  const handleRemoveBanner = (index) => {
    setBannerFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const validateLocation = () => {
    const le      = {}
    const hasLat  = location.coordinates?.[0] !== ''
    const hasLng  = location.coordinates?.[1] !== ''
    const hasCoords = hasLat && hasLng
    if (hasLat  && !hasLng) le.lng = 'Longitude required'
    if (!hasLat && hasLng)  le.lat = 'Latitude required'
    if (!hasCoords) {
      if (!location.address?.trim())  le.address  = 'Required if no coordinates'
      if (!location.city?.trim())     le.city     = 'Required if no coordinates'
      if (!location.district?.trim()) le.district = 'Required if no coordinates'
      if (!location.zipcode?.trim())  le.zipcode  = 'Required if no coordinates'
      if (!location.state?.trim())    le.state    = 'Required if no coordinates'
    }
    return le
  }

  const buildPayload = () => {
    const hasCoords = location.coordinates?.[0] !== '' && location.coordinates?.[1] !== ''
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('isVenueAddress', location.isVenueAddress)
    if (hasCoords) {
      formData.append('coordinates[]', parseFloat(location.coordinates[0]))
      formData.append('coordinates[]', parseFloat(location.coordinates[1]))
    }
    ;['buildingNumber', 'name', 'address', 'city', 'district', 'zipcode', 'state', 'area', 'country'].forEach((k) => {
      if (location[k]?.trim()) formData.append(k, location[k].trim())
    })
    if (logoFile) formData.append('image', logoFile)
    bannerFiles.forEach((b) => formData.append('banners', b.file))
    return formData
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!userId) {
      setApiError('User ID is missing. Please go back and register again.')
      return
    }
    const le = validateLocation()
    if (Object.keys(le).length > 0) { setLocationErrors(le); return }
    setLoading(true)
    try {
      await createLocation(buildPayload())
      onSuccess()
    } catch (err) {
      setApiError(err.message || 'Failed to create location.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Academy Registered Successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Manager: <strong>{userName}</strong> · Academy: <strong>{academyName}</strong>
            </p>
            <p className="text-xs text-emerald-500 mt-1">
              User ID <code className="bg-emerald-100 px-1 rounded font-mono">{userId}</code> has been auto-filled as <code className="bg-emerald-100 px-1 rounded">userId</code>.
            </p>
          </div>
        </div>
      </div>

      <StepIndicator currentStep="location" />
      <ErrorBanner message={apiError} onClose={() => setApiError('')} />

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">📍 Location Details</p>
                <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                  <button type="button" onClick={() => setUseCoords(true)}
                    className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${useCoords ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                    Coordinates
                  </button>
                  <button type="button" onClick={() => setUseCoords(false)}
                    className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${!useCoords ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                    Manual Address
                  </button>
                </div>
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-600">
                  💡 Coordinates are priority. Without them, address/city/district/zipcode/state become required.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldGroup label="User ID (user._id — auto-filled from registration)">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border border-neutral-200 bg-neutral-50 rounded-lg px-3 py-2 text-sm text-neutral-500 font-mono truncate select-all">
                        {userId || <span className="text-red-400">Missing — register academy first</span>}
                      </div>
                      <span className={`text-xs px-2 py-1.5 rounded-lg whitespace-nowrap font-medium flex-shrink-0 border ${userId ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                        {userId ? '✓ Auto-filled' : '✗ Missing'}
                      </span>
                    </div>
                  </FieldGroup>
                </div>

                {useCoords && (
                  <>
                    <FieldGroup label="Latitude *" error={locationErrors.lat}>
                      <TextInput type="number" step="any" placeholder="e.g. 22.3060"
                        value={location.coordinates?.[0] || ''}
                        onChange={(e) => handleCoordsChange(0, e.target.value)}
                        className={locationErrors.lat ? 'border-red-300' : ''} />
                    </FieldGroup>
                    <FieldGroup label="Longitude *" error={locationErrors.lng}>
                      <TextInput type="number" step="any" placeholder="e.g. 74.3558"
                        value={location.coordinates?.[1] || ''}
                        onChange={(e) => handleCoordsChange(1, e.target.value)}
                        className={locationErrors.lng ? 'border-red-300' : ''} />
                    </FieldGroup>
                  </>
                )}

                {!useCoords && (
                  <>
                    <FieldGroup label="Address *" error={locationErrors.address}>
                      <TextInput placeholder="e.g. Near Market Road" value={location.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)} className={locationErrors.address ? 'border-red-300' : ''} />
                    </FieldGroup>
                    <FieldGroup label="City *" error={locationErrors.city}>
                      <TextInput placeholder="e.g. Alirajpur" value={location.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)} className={locationErrors.city ? 'border-red-300' : ''} />
                    </FieldGroup>
                    <FieldGroup label="District *" error={locationErrors.district}>
                      <TextInput placeholder="e.g. Alirajpur" value={location.district || ''}
                        onChange={(e) => handleChange('district', e.target.value)} className={locationErrors.district ? 'border-red-300' : ''} />
                    </FieldGroup>
                    <FieldGroup label="Zipcode *" error={locationErrors.zipcode}>
                      <TextInput placeholder="e.g. 457887" value={location.zipcode || ''}
                        onChange={(e) => handleChange('zipcode', e.target.value)} className={locationErrors.zipcode ? 'border-red-300' : ''} />
                    </FieldGroup>
                    <FieldGroup label="State *" error={locationErrors.state}>
                      <TextInput placeholder="e.g. Madhya Pradesh" value={location.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)} className={locationErrors.state ? 'border-red-300' : ''} />
                    </FieldGroup>
                  </>
                )}

                <FieldGroup label="Building Number">
                  <TextInput placeholder="e.g. 12A" value={location.buildingNumber || ''} onChange={(e) => handleChange('buildingNumber', e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Location Name">
                  <TextInput placeholder="e.g. Main Shop" value={location.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Area">
                  <TextInput placeholder="e.g. Neem Chowk MG Road" value={location.area || ''} onChange={(e) => handleChange('area', e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Country">
                  <TextInput placeholder="e.g. India" value={location.country || ''} onChange={(e) => handleChange('country', e.target.value)} />
                </FieldGroup>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-500">Venue Address?</label>
                  <div className="flex items-center gap-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isVenueAddress" checked={location.isVenueAddress === true}
                        onChange={() => handleChange('isVenueAddress', true)} className="accent-purple-500" />
                      <span className="text-sm text-neutral-700">Yes — Admin adding venue location</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isVenueAddress" checked={location.isVenueAddress === false}
                        onChange={() => handleChange('isVenueAddress', false)} className="accent-purple-500" />
                      <span className="text-sm text-neutral-700">No — User location</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">📸 Location Logo / Image (ogc)</p>
              <ImageUploadBox
                preview={logoPreview}
                fileName={logoFile?.name}
                onFileChange={handleLogoChange}
                onRemove={handleLogoRemove}
              />
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">🖼️ Location Banners</p>
                {bannerFiles.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {bannerFiles.length} added
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mb-4">Upload multiple banner images for this location (optional)</p>
              <BannersUploadBox
                banners={bannerFiles}
                onAdd={handleAddBanners}
                onRemove={handleRemoveBanner}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading || !userId}
                className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? 'Creating…' : '📍 Create Location'}
              </button>
              <button type="button" onClick={onSkip}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100">
                Skip for now
              </button>
            </div>
          </form>
        </div>

        {/* ── Preview panel ── */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-4">
            <p className="text-xs font-medium text-neutral-400 mb-4 uppercase tracking-wide">Location Preview</p>
            {logoPreview && (
              <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-neutral-100">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="bg-neutral-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-neutral-400 mb-0.5">Academy (userId = user._id)</p>
              <p className="text-sm font-semibold text-black">{academyName || '—'}</p>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono text-[10px] truncate">{userId || '—'}</p>
            </div>
            {location.coordinates?.[0] && location.coordinates?.[1] && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-500 mb-1 font-medium">📌 Coordinates</p>
                <p className="text-sm font-mono text-blue-800">
                  {parseFloat(location.coordinates[0]).toFixed(4)}, {parseFloat(location.coordinates[1]).toFixed(4)}
                </p>
              </div>
            )}
            <hr className="border-neutral-100 mb-3" />
            {[
              { label: 'Building', value: location.buildingNumber },
              { label: 'Name',     value: location.name },
              { label: 'Address',  value: location.address },
              { label: 'City',     value: location.city },
              { label: 'District', value: location.district },
              { label: 'Zipcode',  value: location.zipcode },
              { label: 'State',    value: location.state },
              { label: 'Area',     value: location.area },
              { label: 'Country',  value: location.country },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 last:border-0">
                <span className="text-neutral-400">{label}</span>
                <span className="font-medium text-black text-right max-w-[120px] truncate">{value}</span>
              </div>
            ) : null)}
            <div className="flex justify-between items-center text-xs py-2 mt-1">
              <span className="text-neutral-400">Venue?</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${location.isVenueAddress ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {location.isVenueAddress ? 'Yes' : 'No'}
              </span>
            </div>
            {bannerFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-400 mb-2">Banners ({bannerFiles.length})</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {bannerFiles.slice(0, 6).map((b, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-neutral-100 relative" style={{ height: 48 }}>
                      <img src={b.preview} alt="" className="w-full h-full object-cover" />
                      {i === 5 && bannerFiles.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">+{bannerFiles.length - 6}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 1: Register Academy Form ───────────────────────────────────────────
const EMPTY_FORM = {
  name: '', email: '', mobile: '', password: '',
  role: 'academy_manager', academyName: '', description: '',
  openingTime: '', closingTime: '',
}

function RegisterAcademyTab({ onAllDone }) {
  const [step,           setStep]           = useState('register')
  const [registeredData, setRegisteredData] = useState(null)

  const [form,         setForm]         = useState(EMPTY_FORM)
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [bannerFiles,  setBannerFiles]  = useState([])
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [apiError,     setApiError]     = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleAddBanners = (files) => {
    const newEntries = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))
    setBannerFiles((prev) => [...prev, ...newEntries])
  }
  const handleRemoveBanner = (index) => {
    setBannerFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }
  const handleRemoveAllBanners = () => {
    setBannerFiles((prev) => {
      prev.forEach((b) => URL.revokeObjectURL(b.preview))
      return []
    })
  }

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
    const ve = validate()
    if (Object.keys(ve).length > 0) { setErrors(ve); return }
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)
      bannerFiles.forEach((b) => formData.append('banners', b.file))
      const res   = await registerAcademy(formData)
      const inner = res?.data ?? res
      console.log('[RegisterAcademyTab] raw res:', res)
      console.log('[RegisterAcademyTab] inner (passed to CreateLocationStep):', inner)
      setRegisteredData(inner)
      setStep('location')
    } catch (err) {
      setApiError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    handleRemoveAllBanners()
    setErrors({})
    setApiError('')
  }

  if (step === 'location') {
    return (
      <CreateLocationStep
        registeredAcademy={registeredData}
        onSuccess={onAllDone}
        onSkip={onAllDone}
      />
    )
  }

  return (
    <div>
      <ErrorBanner message={apiError} onClose={() => setApiError('')} />
      <StepIndicator currentStep="register" />

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Full Name *" error={errors.name}>
                  <TextInput name="name" value={form.name} onChange={handleChange} placeholder="e.g. Devashish Sharma" className={errors.name ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Email Address *" error={errors.email}>
                  <TextInput name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. myacademy@gmail.com" className={errors.email ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Mobile Number *" error={errors.mobile}>
                  <TextInput name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="e.g. 8889524382" className={errors.mobile ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Password *" error={errors.password}>
                  <TextInput name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className={errors.password ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Role *" error={errors.role}>
                  <select name="role" value={form.role} onChange={handleChange}
                    className={`border rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors bg-white ${errors.role ? 'border-red-300' : 'border-neutral-200'}`}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FieldGroup>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Academy Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Academy Name *" error={errors.academyName}>
                  <TextInput name="academyName" value={form.academyName} onChange={handleChange} placeholder="e.g. Nyra Sports Academy" className={errors.academyName ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Description" error={errors.description}>
                  <TextInput name="description" value={form.description} onChange={handleChange} placeholder="e.g. Sports all" />
                </FieldGroup>
                <FieldGroup label="Opening Time *" error={errors.openingTime}>
                  <TextInput name="openingTime" value={form.openingTime} onChange={handleChange} placeholder="e.g. 06:00 AM" className={errors.openingTime ? 'border-red-300' : ''} />
                </FieldGroup>
                <FieldGroup label="Closing Time *" error={errors.closingTime}>
                  <TextInput name="closingTime" value={form.closingTime} onChange={handleChange} placeholder="e.g. 10:00 PM" className={errors.closingTime ? 'border-red-300' : ''} />
                </FieldGroup>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Academy Image</p>
              <ImageUploadBox
                preview={imagePreview}
                fileName={imageFile?.name}
                onFileChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
                }}
                onRemove={() => { setImageFile(null); setImagePreview('') }}
              />
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Academy Banners</p>
                {bannerFiles.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {bannerFiles.length} added
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Upload multiple banner images for the academy — these appear in the app carousel (optional)
              </p>
              <BannersUploadBox
                banners={bannerFiles}
                onAdd={handleAddBanners}
                onRemove={handleRemoveBanner}
                onRemoveAll={handleRemoveAllBanners}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? 'Registering…' : 'Register Academy →'}
              </button>
              <button type="button" onClick={handleReset}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ── Live Preview ── */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-4">
            <p className="text-xs font-medium text-neutral-400 mb-4 uppercase tracking-wide">Live Preview</p>
            <div className="rounded-xl overflow-hidden bg-neutral-100 mb-4" style={{ height: 100 }}>
              {imagePreview
                ? <img src={imagePreview} alt="Academy" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><span className="text-neutral-300 text-xs">No image yet</span></div>
              }
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {form.name?.trim() ? initials(form.name) : '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black truncate">{form.name || <span className="text-neutral-300">Full name</span>}</p>
                <p className="text-xs text-neutral-400 truncate">{form.email || <span className="text-neutral-300">Email address</span>}</p>
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
              { label: 'Banners',     value: bannerFiles.length ? `${bannerFiles.length} image${bannerFiles.length !== 1 ? 's' : ''}` : '' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 last:border-0">
                <span className="text-neutral-400">{label}</span>
                <span className={`font-medium text-right max-w-[140px] truncate ${value ? 'text-black' : 'text-neutral-300'}`}>{value || '—'}</span>
              </div>
            ))}
            {form.role && (
              <div className="mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_STYLES[form.role] || 'bg-neutral-100 text-neutral-700'}`}>{form.role}</span>
              </div>
            )}
            {bannerFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-400 mb-2">Banner previews</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {bannerFiles.slice(0, 6).map((b, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-neutral-100 relative" style={{ height: 48 }}>
                      <img src={b.preview} alt="" className="w-full h-full object-cover" />
                      {i === 5 && bannerFiles.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">+{bannerFiles.length - 6}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AcademyJoin() {
  const [activeTab, setActiveTab] = useState('managers')
  const [tableKey,  setTableKey]  = useState(0)

  const tabs = [
    { id: 'managers', label: 'Academy Managers' },
    { id: 'register', label: '+ Register Academy' },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Academies</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage academy managers and register new academies</p>
        </div>
      </div>
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'managers'
        ? <AcademyManagersTab key={tableKey} />
        : <RegisterAcademyTab onAllDone={() => { setTableKey((k) => k + 1); setActiveTab('managers') }} />
      }
    </div>
  )
}