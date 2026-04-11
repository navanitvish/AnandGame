import { useState, useEffect } from 'react'
import {
  Grid, Plus, Trash2, Search, LayoutGrid, List,
  Edit, Eye, X, AlertCircle, RefreshCw,
  Shield, Layers, DollarSign, CheckCircle,
  ToggleLeft, ToggleRight, MapPin
} from 'lucide-react'
import api from '../api/api'

// ── API calls ─────────────────────────────────────────────────────────────────
const getCourts    = ()        => api.get('/courts/getAll')
const createCourt  = (body)    => api.post('/courts/create', body)           // JSON
const updateCourt  = (id, body)=> api.put(`/courts/update/${id}`, body)      // JSON
const deleteCourt  = (id)      => api.delete(`/courts/delete/${id}`)
const toggleCourt  = (id)      => api.patch(`/courts/${id}/toggle`)

const fetchGrounds = ()        => api.get('/grounds/getAll')

// ── Helpers ───────────────────────────────────────────────────────────────────
const toList  = (res) => {
  if (Array.isArray(res))             return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data))       return res.data
  return []
}
const getId   = (f) => (typeof f === 'object' && f !== null ? f?._id  : f) || ''
const getName = (f) => (typeof f === 'object' && f !== null ? f?.name : f) || '—'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTS = ['available', 'unavailable', 'maintenance']

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-400/20 transition-all bg-white'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5'

const emptyForm = {
  groundId: '', name: '', description: '',
  pricePerHour: '', status: 'available', isActive: true,
}

// ── Status badge color ────────────────────────────────────────────────────────
const statusColor = (s) => {
  if (s === 'available')   return 'bg-green-50 text-green-700 border-green-200'
  if (s === 'unavailable') return 'bg-red-50 text-red-600 border-red-200'
  if (s === 'maintenance') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-gray-100 text-gray-500 border-gray-200'
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }
  return { toasts, show }
}
function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white
            ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {t.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0" />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ show, name, loading, onConfirm, onCancel }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-80">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Delete Court?</h3>
          <p className="text-sm text-gray-500">
            Delete <span className="font-semibold">"{name}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-60">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ court, onClose, onEdit }) {
  if (!court) return null
  const rows = [
    { label: 'Court Name',   value: court.name },
    { label: 'Ground',       value: getName(court.groundId) },
    { label: 'Price / Hour', value: court.pricePerHour ? `₹${court.pricePerHour}` : '—' },
    { label: 'Status',       value: court.status || '—' },
    { label: 'Is Active',    value: court.isActive ? 'Yes' : 'No' },
    { label: 'Created',      value: court.createdAt
        ? new Date(court.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
        : '—' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center">
              <Grid className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{court.name}</h3>
              <p className="text-xs text-gray-400">Court Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onEdit(court); onClose() }}
              className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100">
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium border capitalize ${statusColor(court.status)}`}>
            {court.status || 'unknown'}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium border
            ${court.isActive ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
            {court.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Info grid */}
        <div className="p-5 grid grid-cols-2 gap-2">
          {rows.map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {court.description && (
          <div className="px-5 pb-5">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{court.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function CourtFormModal({ show, editCourt, grounds, onClose, onSaved, toast }) {
  const [form,    setForm]    = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  useEffect(() => {
    if (editCourt) {
      setForm({
        groundId:     getId(editCourt.groundId) || '',
        name:         editCourt.name            || '',
        description:  editCourt.description     || '',
        pricePerHour: editCourt.pricePerHour    ?? '',
        status:       editCourt.status          || 'available',
        isActive:     editCourt.isActive        ?? true,
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [editCourt, show])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.groundId)        e.groundId     = 'Ground is required'
    if (!form.name.trim())     e.name         = 'Name is required'
    if (!form.pricePerHour || isNaN(Number(form.pricePerHour))) e.pricePerHour = 'Valid price required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    // JSON body — exactly matching Postman
    const body = {
      groundId:     form.groundId,
      name:         form.name.trim(),
      description:  form.description.trim(),
      pricePerHour: Number(form.pricePerHour),
      status:       form.status,
      isActive:     form.isActive,
    }

    setLoading(true)
    try {
      if (editCourt) {
        await updateCourt(editCourt._id || editCourt.id, body)
        toast('Court updated successfully!', 'success')
      } else {
        await createCourt(body)
        toast('Court created successfully!', 'success')
      }
      onSaved(); onClose()
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  const err = (k) => errors[k]
    ? <p className="text-xs text-red-500 mt-1">{errors[k]}</p>
    : null

  const cls = (k) =>
    `${inputCls} ${errors[k] ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center
              ${editCourt ? 'bg-amber-50 border border-amber-200' : 'bg-purple-50 border border-purple-200'}`}>
              {editCourt
                ? <Edit className="h-4 w-4 text-amber-500" />
                : <Plus className="h-4 w-4 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {editCourt ? 'Edit Court' : 'Add New Court'}
              </h2>
              <p className="text-xs text-gray-400">* required fields · sent as JSON</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Ground ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Linked Ground *</p>
            <div>
              <label className={labelCls}>Ground *</label>
              <select value={form.groundId}
                onChange={e => { set('groundId', e.target.value); setErrors(er => ({ ...er, groundId: '' })) }}
                className={cls('groundId')}>
                <option value="">Select a ground…</option>
                {grounds.map(g => (
                  <option key={g._id || g.id} value={g._id || g.id}>{g.name}</option>
                ))}
              </select>
              {err('groundId')}
            </div>
          </div>

          {/* ── Basic Info ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Basic Info</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Court Name *</label>
                <input type="text" placeholder="e.g. Court 1"
                  value={form.name}
                  onChange={e => { set('name', e.target.value); setErrors(er => ({ ...er, name: '' })) }}
                  className={cls('name')} />
                {err('name')}
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} placeholder="Short description of the court…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* ── Pricing & Status ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pricing & Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Price */}
              <div>
                <label className={labelCls}>Price Per Hour *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium select-none">₹</span>
                  <input type="number" min="0" placeholder="500"
                    value={form.pricePerHour}
                    onChange={e => { set('pricePerHour', e.target.value); setErrors(er => ({ ...er, pricePerHour: '' })) }}
                    className={`${cls('pricePerHour')} pl-7`} />
                </div>
                {err('pricePerHour')}
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                  {STATUS_OPTS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Is Active toggle ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Visibility</p>
            <button
              onClick={() => set('isActive', !form.isActive)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all
                ${form.isActive
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              {form.isActive
                ? <ToggleRight className="h-5 w-5 shrink-0" />
                : <ToggleLeft  className="h-5 w-5 shrink-0" />}
              <div className="text-left">
                <p className="text-sm font-semibold">
                  {form.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs opacity-60">
                  {form.isActive ? 'Court is visible and bookable' : 'Court is hidden from users'}
                </p>
              </div>
            </button>
          </div>

          {/* JSON preview */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Request Preview (JSON)</p>
            <pre className="bg-neutral-950 text-green-400 text-[10px] rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
{JSON.stringify({
  groundId:     form.groundId     || '<required>',
  name:         form.name         || '<required>',
  description:  form.description,
  pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : '<required>',
  status:       form.status,
  isActive:     form.isActive,
}, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : editCourt ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {loading ? 'Saving...' : editCourt ? 'Update Court' : 'Add Court'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Courts() {
  const { toasts, show: toast } = useToast()

  const [courts,       setCourts]       = useState([])
  const [grounds,      setGrounds]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState('table')
  const [showForm,     setShowForm]     = useState(false)
  const [editCourt,    setEditCourt]    = useState(null)
  const [viewCourt,    setViewCourt]    = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [togglingId,   setTogglingId]   = useState(null)

  useEffect(() => { fetchAll(); loadGrounds() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getCourts()
      setCourts(toList(res))
    } catch (err) {
      toast(err.message || 'Failed to load courts', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadGrounds = async () => {
    try {
      const res = await fetchGrounds()
      setGrounds(toList(res))
    } catch { /* silent */ }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteCourt(deleteTarget.id)
      toast('Court deleted!', 'success')
      setDeleteTarget(null); fetchAll()
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    } finally { setDeleting(false) }
  }

  const handleToggle = async (court) => {
    const id = court._id || court.id
    setTogglingId(id)
    try {
      await toggleCourt(id)
      setCourts(prev => prev.map(c => (c._id||c.id)===id ? {...c, isActive:!c.isActive} : c))
      toast(`Marked ${court.isActive ? 'Inactive' : 'Active'}`, 'success')
    } catch {
      try {
        await updateCourt(id, { isActive: !court.isActive })
        setCourts(prev => prev.map(c => (c._id||c.id)===id ? {...c, isActive:!c.isActive} : c))
        toast(`Marked ${court.isActive ? 'Inactive' : 'Active'}`, 'success')
      } catch (e2) { toast(e2.message || 'Toggle failed', 'error') }
    } finally { setTogglingId(null) }
  }

  const filtered = courts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q) ||
      getName(c.groundId).toLowerCase().includes(q)
    )
  })

  const activeCount = courts.filter(c => c.isActive).length
  const availCount  = courts.filter(c => c.status === 'available').length

  const stats = [
    { label:'Total Courts',  value: courts.length,              sub:`${activeCount} active`,    icon: Grid,       color:'bg-purple-600' },
    { label:'Active',        value: activeCount,                sub:'visible to users',         icon: Shield,     color:'bg-green-600'  },
    { label:'Available',     value: availCount,                 sub:'ready to book',            icon: CheckCircle,color:'bg-blue-600'   },
    { label:'Grounds',       value: new Set(courts.map(c => getId(c.groundId))).size,
                                                                sub:'linked',                   icon: MapPin,     color:'bg-black'      },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <ConfirmModal
        show={!!deleteTarget} name={deleteTarget?.name}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ViewModal
        court={viewCourt}
        onClose={() => setViewCourt(null)}
        onEdit={c => { setEditCourt(c); setShowForm(true) }}
      />

      <CourtFormModal
        show={showForm} editCourt={editCourt}
        grounds={grounds}
        onClose={() => { setShowForm(false); setEditCourt(null) }}
        onSaved={fetchAll} toast={toast}
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <Grid className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Courts</h1>
          </div>
          <p className="text-neutral-500 text-sm">Manage all courts — linked to sport grounds</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditCourt(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
            <Plus className="h-4 w-4" /> Add Court
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-black leading-none">{value}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
              <p className="text-[10px] text-neutral-300">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input type="text" placeholder="Search name, ground, status..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
          {search && (
            <button onClick={() => setSearch('')} className="text-neutral-300 hover:text-neutral-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <span className="text-xs text-neutral-400 ml-auto">
          {filtered.length} court{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex bg-neutral-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${viewMode==='table' ? 'bg-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}>
            <List className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode==='grid' ? 'bg-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading courts...</p>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['#','Name','Ground','Description','Price / hr','Status','Active','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-neutral-400 text-sm">
                    <Grid className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
                    No courts found
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const id = c._id || c.id
                return (
                  <tr key={id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                    <td className="px-4 py-3 text-neutral-400 text-xs">{i + 1}</td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                          <Grid className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <p className="text-xs font-semibold text-black">{c.name}</p>
                      </div>
                    </td>

                    {/* Ground */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {getName(c.groundId)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-xs text-neutral-500 truncate">{c.description || '—'}</p>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-neutral-400" />
                        <span className="text-xs font-semibold text-neutral-700">
                          {c.pricePerHour ? `₹${c.pricePerHour}` : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize ${statusColor(c.status)}`}>
                        {c.status || '—'}
                      </span>
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(c)} disabled={togglingId===id}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-60 transition-all
                          ${c.isActive
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                        {togglingId===id ? '...' : c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewCourt(c)}
                          className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setEditCourt(c); setShowForm(true) }}
                          className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id, name: c.name })}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
              Showing {filtered.length} of {courts.length} courts
            </div>
          )}
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-neutral-200 py-14 text-center">
              <Grid className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
              <p className="text-neutral-400 text-sm">No courts found</p>
            </div>
          ) : filtered.map(c => {
            const id = c._id || c.id
            return (
              <div key={id}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden">

                {/* Card header */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/40 px-5 pt-5 pb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Grid className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{c.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{getName(c.groundId)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggle(c)} disabled={togglingId===id}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer disabled:opacity-60 shrink-0 border
                      ${c.isActive
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                    {togglingId===id ? '...' : c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="p-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize ${statusColor(c.status)}`}>
                      {c.status || 'unknown'}
                    </span>
                    {c.pricePerHour && (
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                        ₹{c.pricePerHour}/hr
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {c.description && (
                    <p className="text-[11px] text-neutral-500 mb-3 line-clamp-2">{c.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-neutral-100">
                    <button onClick={() => setViewCourt(c)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-500 border border-blue-200 bg-blue-50 rounded-lg py-1.5 hover:bg-blue-100">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button onClick={() => { setEditCourt(c); setShowForm(true) }}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-purple-600 border border-purple-200 bg-purple-50 rounded-lg py-1.5 hover:bg-purple-100">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget({ id, name: c.name })}
                      className="w-9 flex items-center justify-center text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}