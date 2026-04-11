import { useState, useEffect, useRef } from 'react'
import {
  getSports,
  createSport,
  updateSport,
  deleteSport,
  toggleSportStatus,
} from '../api/api'

// ─── Toast Hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }
  return { toasts, show }
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white
            ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ show, name, loading, onConfirm, onCancel }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-80">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-500 text-xl">⚠</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Delete Sport?</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-800">"{name}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-medium disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ sport, onClose }) {
  if (!sport) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Sport Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {sport.image ? (
          <img
            src={sport.image}
            alt={sport.name}
            className="w-full h-40 object-cover rounded-xl mb-4 bg-gray-100"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-32 rounded-xl mb-4 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
            <span className="text-5xl">🏆</span>
          </div>
        )}

        <div className="space-y-2">
          {[
            { label: 'ID',          value: sport._id || sport.id },
            { label: 'Name',        value: sport.name },
            { label: 'Description', value: sport.description || '—' },
            {
              label: 'Status',
              value: (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${sport.isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {sport.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              label: 'Created',
              value: sport.createdAt ? new Date(sport.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 mt-0.5">{label}</span>
              <span className="text-sm text-gray-800 break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add / Edit Form Modal ────────────────────────────────────────────────────
function SportFormModal({ show, editSport, onClose, onSaved, toast }) {
  const fileRef = useRef(null)
  const [form, setForm]       = useState({ name: '', description: '', isActive: 'true' })
  const [preview, setPreview] = useState(null)
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (editSport) {
      setForm({
        name:        editSport.name        || '',
        description: editSport.description || '',
        isActive:    editSport.isActive !== undefined ? String(editSport.isActive) : 'true',
      })
      setPreview(editSport.image || null)
    } else {
      setForm({ name: '', description: '', isActive: 'true' })
      setPreview(null)
    }
    setFile(null)
    setErrors({})
  }, [editSport, show])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    return e
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const fd = new FormData()
    fd.append('name',        form.name.trim())
    fd.append('description', form.description.trim())
    fd.append('isActive',    form.isActive)
    if (file) fd.append('image', file)

    setLoading(true)
    try {
      if (editSport) {
        await updateSport(editSport._id || editSport.id, fd)
        toast('Sport updated successfully!', 'success')
      } else {
        await createSport(fd)
        toast('Sport created successfully!', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">
            {editSport ? 'Edit Sport' : 'Add New Sport'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Image Upload */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Image <span className="text-neutral-300">(optional)</span>
            </label>
            <div
              onClick={() => fileRef.current.click()}
              className="relative w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden bg-gray-50"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">📷</div>
                  <p className="text-xs text-gray-400">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {preview && (
              <button
                onClick={() => {
                  setPreview(null)
                  setFile(null)
                  if (fileRef.current) fileRef.current.value = ''
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
              >
                Remove image
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Name *</label>
            <input
              type="text"
              placeholder="e.g. Table-tennis"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                setErrors({ ...errors, name: '' })
              }}
              className={`w-full border rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors
                ${errors.name ? 'border-red-400' : 'border-neutral-200'}`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Description <span className="text-neutral-300">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Best game for India"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Status <span className="text-neutral-300">(optional, default Active)</span>
            </label>
            <select
              value={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.value })}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-60"
          >
            {loading
              ? editSport ? 'Saving...' : 'Adding...'
              : editSport ? 'Save Changes' : 'Add Sport'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SPORTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Sports() {
  const { toasts, show: toast } = useToast()

  const [sports,       setSports]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [editSport,    setEditSport]    = useState(null)
  const [viewSport,    setViewSport]    = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [togglingId,   setTogglingId]   = useState(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // API response shape:
  // { success: true, data: { total, totalPages, page, limit, data: [...sports] } }
  const fetchSports = async () => {
    setLoading(true)
    try {
      const res = await getSports()
      // Handle all possible shapes
      let list = []
      if (Array.isArray(res)) {
        list = res
      } else if (Array.isArray(res.data)) {
        list = res.data
      } else if (Array.isArray(res.data?.data)) {
        list = res.data.data          // ← your API returns data.data array
      } else {
        list = []
      }
      setSports(list)
    } catch (err) {
      toast(err.message || 'Failed to load sports', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSports() }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteSport(deleteTarget.id)
      toast('Sport deleted!', 'success')
      setDeleteTarget(null)
      fetchSports()
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Toggle Status ──────────────────────────────────────────────────────────
  const handleToggle = async (sport) => {
    const id = sport._id || sport.id
    setTogglingId(id)
    try {
      await toggleSportStatus(id)
      toast(`Marked as ${sport.isActive ? 'Inactive' : 'Active'}`, 'success')
      fetchSports()
    } catch {
      try {
        const fd = new FormData()
        fd.append('name',        sport.name)
        fd.append('description', sport.description || '')
        fd.append('isActive',    String(!sport.isActive))
        await updateSport(id, fd)
        toast(`Marked as ${sport.isActive ? 'Inactive' : 'Active'}`, 'success')
        fetchSports()
      } catch (err2) {
        toast(err2.message || 'Toggle failed', 'error')
      }
    } finally {
      setTogglingId(null)
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = sports.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  )

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <ToastContainer toasts={toasts} />

      <ConfirmModal
        show={!!deleteTarget}
        name={deleteTarget?.name}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ViewModal sport={viewSport} onClose={() => setViewSport(null)} />

      <SportFormModal
        show={showForm}
        editSport={editSport}
        onClose={() => { setShowForm(false); setEditSport(null) }}
        onSaved={fetchSports}
        toast={toast}
      />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Sports</h1>
          <p className="text-neutral-500 text-sm mt-1">{sports.length} total sports</p>
        </div>
        <button
          onClick={() => { setEditSport(null); setShowForm(true) }}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Sport
        </button>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">#</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Image</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Name</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Description</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Created</th>
              <th className="text-left px-5 py-3 text-neutral-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    <span className="text-sm">Loading sports...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                  {search
                    ? 'No sports match your search.'
                    : 'No sports yet. Click "+ Add Sport" to create one!'}
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => {
                const id = s._id || s.id
                return (
                  <tr
                    key={id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    {/* # */}
                    <td className="px-5 py-3 text-neutral-400">{i + 1}</td>

                    {/* Image */}
                    <td className="px-5 py-3">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg">
                          🏆
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-black capitalize">{s.name}</td>

                    {/* Description */}
                    <td className="px-5 py-3 text-neutral-500 max-w-xs">
                      <span className="line-clamp-1">{s.description || '—'}</span>
                    </td>

                    {/* Status — clickable toggle */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(s)}
                        disabled={togglingId === id}
                        title="Click to toggle status"
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all disabled:opacity-60 cursor-pointer
                          ${s.isActive
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                      >
                        {togglingId === id ? '...' : s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3 text-neutral-400 text-xs whitespace-nowrap">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewSport(s)}
                          className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setEditSport(s); setShowForm(true) }}
                          className="text-xs text-purple-400 hover:text-purple-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id, name: s.name })}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination info ───────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
            Showing {filtered.length} of {sports.length} sports
          </div>
        )}
      </div>
    </div>
  )
}