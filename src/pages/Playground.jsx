import { useState, useEffect, useRef } from 'react'
import {
  MapPin, Plus, Trash2, Search, LayoutGrid, List,
  Users, User, Map, Edit, Eye, X, AlertCircle,
  RefreshCw, Clock, Shield, Layers, Calendar
} from 'lucide-react'
import api from '../api/api'

// ── API calls ─────────────────────────────────────────────────────────────────
const getGrounds    = ()       => api.get('/sportGrounds/getAll')
const createGround  = (fd)     => api.post('/sportGrounds/create', fd)
const updateGround  = (id, fd) => api.put(`/sportGrounds/update/${id}`, fd)
const deleteGround  = (id)     => api.delete(`/sportGrounds/delete/${id}`)
const toggleGround  = (id)     => api.patch(`/sportGrounds/${id}/toggle`)

const fetchVenues     = () => api.get('/venues/getAll')
const fetchSports     = () => api.get('/sports/getAll')
const fetchCategories = () => api.get('/categories/getAll')

// ── Response shape:
// venueId / sportId / categoryId are POPULATED objects: { _id, name, image, description }
// So: g.venueId.name, g.sportId.name, g.categoryId.name

// ── Helpers ───────────────────────────────────────────────────────────────────
const toList = (res) => {
  if (Array.isArray(res))             return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data))       return res.data
  return []
}

// field can be a string ID or populated { _id, name }
const getId   = (f) => (typeof f === 'object' && f !== null ? f?._id  : f) || ''
const getName = (f) => (typeof f === 'object' && f !== null ? f?.name : f) || '—'
const getImg  = (f) => (typeof f === 'object' && f !== null ? f?.image : null) || null

// ── Styles ────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-400/20 transition-all bg-white'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5'

const emptyForm = {
  venueId:'', sportId:'', categoryId:'', name:'', description:'',
  coach:'', openingTime:'', closingTime:'', level:'',
  sportDurationInHours:'', sportDate:'', maxPlayers:'',
  minPlayers:'', maxTeams:'', minTeams:'',
  isPrivate:'false', isAvailable:'true', isActive:'true',
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }
  return { toasts, show }
}
function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white
          ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
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
          <h3 className="font-bold text-gray-900 mb-1">Delete Ground?</h3>
          <p className="text-sm text-gray-500">Delete <span className="font-semibold">"{name}"</span>? Cannot be undone.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
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
function ViewModal({ ground, onClose, onEdit }) {
  if (!ground) return null
  const rows = [
    { label: 'Name',           value: ground.name },
    { label: 'Venue',          value: getName(ground.venueId) },
    { label: 'Sport',          value: getName(ground.sportId) },
    { label: 'Category',       value: getName(ground.categoryId) },
    { label: 'Coach',          value: ground.coach || '—' },
    { label: 'Level',          value: (ground.level && ground.level !== 'null') ? ground.level : '—' },
    { label: 'Duration (hrs)', value: ground.sportDurationInHours ?? '—' },
    { label: 'Sport Date',     value: ground.sportDateDisplay || '—' },
    { label: 'Timing',         value: ground.sportTimingDisplay || '—' },
    { label: 'Max Players',    value: ground.maxPlayers ?? '—' },
    { label: 'Min Players',    value: ground.minPlayers ?? '—' },
    { label: 'Private',        value: ground.isPrivate ? 'Yes' : 'No' },
    { label: 'Available',      value: ground.isAvailable ? 'Yes' : 'No' },
    { label: 'Full',           value: ground.isFull ? 'Yes' : 'No' },
    { label: 'Status',         value: ground.isActive ? 'Active' : 'Inactive' },
    { label: 'Created',        value: ground.createdAt ? new Date(ground.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{ground.name}</h3>
              <p className="text-xs text-gray-400">Ground Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onEdit(ground); onClose() }}
              className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100">
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {ground.image && (
          <img src={ground.image} alt={ground.name} className="w-full h-44 object-cover"
            onError={e => e.target.style.display = 'none'} />
        )}

        {ground.features?.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {ground.features.map((f, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-purple-700">{f.title}</p>
                  {f.description && <p className="text-[10px] text-purple-500 mt-0.5">{f.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 grid grid-cols-2 gap-2">
          {rows.map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function GroundFormModal({ show, editGround, venues, sports, categories, onClose, onSaved, toast }) {
  const fileRef = useRef(null)
  const [form, setForm]       = useState(emptyForm)
  const [preview, setPreview] = useState(null)
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (editGround) {
      setForm({
        venueId:              getId(editGround.venueId)    || '',
        sportId:              getId(editGround.sportId)    || '',
        categoryId:           getId(editGround.categoryId) || '',
        name:                 editGround.name                 || '',
        description:          editGround.description          || '',
        coach:                editGround.coach                || '',
        openingTime:          editGround.openingTime          || '',
        closingTime:          editGround.closingTime          || '',
        level:                (editGround.level && editGround.level !== 'null') ? editGround.level : '',
        sportDurationInHours: editGround.sportDurationInHours ?? '',
        sportDate:            editGround.sportDate ? editGround.sportDate.slice(0, 16) : '',
        maxPlayers:           editGround.maxPlayers ?? '',
        minPlayers:           editGround.minPlayers ?? '',
        maxTeams:             editGround.maxTeams   ?? '',
        minTeams:             editGround.minTeams   ?? '',
        isPrivate:            String(editGround.isPrivate   ?? false),
        isAvailable:          String(editGround.isAvailable ?? true),
        isActive:             String(editGround.isActive    ?? true),
      })
      setPreview(editGround.image || null)
    } else {
      setForm(emptyForm); setPreview(null)
    }
    setFile(null); setErrors({})
  }, [editGround, show])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.venueId)     e.venueId    = 'Venue required'
    if (!form.sportId)     e.sportId    = 'Sport required'
    if (!form.categoryId)  e.categoryId = 'Category required'
    if (!form.name.trim()) e.name       = 'Name required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const fd = new FormData()
    Object.entries({
      venueId: form.venueId, sportId: form.sportId, categoryId: form.categoryId,
      name: form.name.trim(), description: form.description.trim(),
      coach: form.coach.trim(), openingTime: form.openingTime, closingTime: form.closingTime,
      level: form.level, sportDurationInHours: form.sportDurationInHours,
      sportDate: form.sportDate, maxPlayers: form.maxPlayers, minPlayers: form.minPlayers,
      maxTeams: form.maxTeams, minTeams: form.minTeams,
      isPrivate: form.isPrivate, isAvailable: form.isAvailable, isActive: form.isActive,
    }).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append('image', file)

    setLoading(true)
    try {
      if (editGround) {
        await updateGround(editGround._id || editGround.id, fd)
        toast('Ground updated!', 'success')
      } else {
        await createGround(fd)
        toast('Ground created!', 'success')
      }
      onSaved(); onClose()
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  const Field = ({ label, k, type = 'text', ph = '' }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} placeholder={ph} value={form[k]}
        onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
        className={`${inputCls} ${errors[k] ? 'border-red-300' : ''}`} />
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )

  const DropDown = ({ label, k, options, ph = 'Select…' }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={form[k]}
        onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
        className={`${inputCls} ${errors[k] ? 'border-red-300' : ''}`}>
        <option value="">{ph}</option>
        {options.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>)}
      </select>
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )

  const BoolSel = ({ label, k }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={form[k]} onChange={e => set(k, e.target.value)} className={inputCls}>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${editGround ? 'bg-amber-50 border border-amber-200' : 'bg-purple-50 border border-purple-200'}`}>
              {editGround ? <Edit className="h-4 w-4 text-amber-500" /> : <Plus className="h-4 w-4 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{editGround ? 'Edit Ground' : 'Add New Ground'}</h2>
              <p className="text-xs text-gray-400">* required fields</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Linked IDs */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Linked References *</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DropDown label="Venue *"    k="venueId"    options={venues}     ph="Select venue" />
              <DropDown label="Sport *"    k="sportId"    options={sports}     ph="Select sport" />
              <DropDown label="Category *" k="categoryId" options={categories} ph="Select category" />
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Ground Name *" k="name"  ph="e.g. Cricket Ground 1" />
              <Field label="Coach"         k="coach" ph="Coach name" />
              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short description…"
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* Timing */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Timing</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Opening Time"    k="openingTime"          type="time" />
              <Field label="Closing Time"    k="closingTime"          type="time" />
              <Field label="Duration (hrs)"  k="sportDurationInHours" type="number" ph="2" />
              <Field label="Sport Date"      k="sportDate"            type="datetime-local" />
            </div>
          </div>

          {/* Players & Teams */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Players & Teams</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Max Players" k="maxPlayers" type="number" ph="22" />
              <Field label="Min Players" k="minPlayers" type="number" ph="1"  />
              <Field label="Max Teams"   k="maxTeams"   type="number" ph="2"  />
              <Field label="Min Teams"   k="minTeams"   type="number" ph="1"  />
            </div>
          </div>

          {/* Settings */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Settings</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Level</label>
                <select value={form.level} onChange={e => set('level', e.target.value)} className={inputCls}>
                  <option value="">Select level</option>
                  {['beginner','Intermediate','Advanced','Professional'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <BoolSel label="Is Private"   k="isPrivate" />
              <BoolSel label="Is Available" k="isAvailable" />
              <BoolSel label="Is Active"    k="isActive" />
            </div>
          </div>

          {/* Image */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Image</p>
            <div onClick={() => fileRef.current?.click()}
              className="flex items-center gap-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all">
              {preview
                ? <img src={preview} alt="preview" className="h-16 w-24 object-cover rounded-xl border border-gray-200 flex-shrink-0" onError={e => e.target.style.display='none'} />
                : <div className="h-16 w-24 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="h-6 w-6 text-purple-400" /></div>
              }
              <div>
                <p className="text-sm font-medium text-gray-600">{file ? file.name : 'Click to upload image'}</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB (optional)</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)) } }} />
            </div>
            {(preview || file) && (
              <button onClick={() => { setPreview(null); setFile(null); if (fileRef.current) fileRef.current.value='' }}
                className="text-xs text-red-400 hover:text-red-600 mt-1.5">Remove image</button>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : editGround ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {loading ? 'Saving...' : editGround ? 'Update Ground' : 'Add Ground'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function SportGrounds() {
  const { toasts, show: toast } = useToast()

  const [grounds,      setGrounds]      = useState([])
  const [venues,       setVenues]       = useState([])
  const [sports,       setSports]       = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState('table')
  const [showForm,     setShowForm]     = useState(false)
  const [editGround,   setEditGround]   = useState(null)
  const [viewGround,   setViewGround]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [togglingId,   setTogglingId]   = useState(null)

  useEffect(() => { fetchAll(); loadDropdowns() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getGrounds()
      setGrounds(toList(res))
    } catch (err) {
      toast(err.message || 'Failed to load grounds', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadDropdowns = async () => {
    const [vR, sR, cR] = await Promise.allSettled([fetchVenues(), fetchSports(), fetchCategories()])
    if (vR.status === 'fulfilled') setVenues(toList(vR.value))
    if (sR.status === 'fulfilled') setSports(toList(sR.value))
    if (cR.status === 'fulfilled') setCategories(toList(cR.value))
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteGround(deleteTarget.id)
      toast('Ground deleted!', 'success')
      setDeleteTarget(null); fetchAll()
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    } finally { setDeleting(false) }
  }

  const handleToggle = async (ground) => {
    const id = ground._id || ground.id
    setTogglingId(id)
    try {
      await toggleGround(id)
      setGrounds(prev => prev.map(g => (g._id||g.id)===id ? {...g, isActive:!g.isActive} : g))
      toast(`Marked ${ground.isActive ? 'Inactive' : 'Active'}`, 'success')
    } catch {
      try {
        const fd = new FormData(); fd.append('isActive', String(!ground.isActive))
        await updateGround(id, fd)
        setGrounds(prev => prev.map(g => (g._id||g.id)===id ? {...g, isActive:!g.isActive} : g))
        toast(`Marked ${ground.isActive ? 'Inactive' : 'Active'}`, 'success')
      } catch (e2) { toast(e2.message || 'Toggle failed', 'error') }
    } finally { setTogglingId(null) }
  }

  const filtered = grounds.filter(g => {
    const q = search.toLowerCase()
    return (
      g.name?.toLowerCase().includes(q) ||
      g.coach?.toLowerCase().includes(q) ||
      getName(g.venueId).toLowerCase().includes(q) ||
      getName(g.sportId).toLowerCase().includes(q) ||
      getName(g.categoryId).toLowerCase().includes(q)
    )
  })

  const activeCount = grounds.filter(g => g.isActive).length
  const stats = [
    { label:'Total Grounds', value:grounds.length,              sub:`${activeCount} active`,  icon:Map,      color:'bg-purple-600' },
    { label:'Active',        value:activeCount,                 sub:'available now',          icon:Shield,   color:'bg-green-600'  },
    { label:'Inactive',      value:grounds.length - activeCount,sub:'not available',          icon:Layers,   color:'bg-neutral-600'},
    { label:'Sports',        value:new Set(grounds.map(g=>getId(g.sportId))).size, sub:'types', icon:Calendar, color:'bg-black'    },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <ConfirmModal show={!!deleteTarget} name={deleteTarget?.name} loading={deleting}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

      <ViewModal ground={viewGround} onClose={() => setViewGround(null)}
        onEdit={g => { setEditGround(g); setShowForm(true) }} />

      <GroundFormModal show={showForm} editGround={editGround}
        venues={venues} sports={sports} categories={categories}
        onClose={() => { setShowForm(false); setEditGround(null) }}
        onSaved={fetchAll} toast={toast} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Sport Grounds</h1>
          </div>
          <p className="text-neutral-500 text-sm">Manage all sport grounds — venue, sport & category linked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditGround(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
            <Plus className="h-4 w-4" /> Add Ground
          </button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input type="text" placeholder="Search name, coach, venue, sport..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
        </div>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} ground{filtered.length !== 1 ? 's' : ''}</span>
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

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading grounds...</p>
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['#','Image','Name','Venue','Sport','Category','Coach','Timing','Players','Date','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={12} className="text-center py-14 text-neutral-400 text-sm">
                  <MapPin className="h-7 w-7 mx-auto mb-2 text-neutral-200" />No grounds found
                </td></tr>
              ) : filtered.map((g, i) => {
                const id = g._id || g.id
                return (
                  <tr key={id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-neutral-400 text-xs">{i + 1}</td>

                    {/* Image */}
                    <td className="px-4 py-3">
                      {g.image
                        ? <img src={g.image} alt={g.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" onError={e=>e.target.style.display='none'} />
                        : <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><MapPin className="h-4 w-4 text-purple-500" /></div>
                      }
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-black">{g.name}</p>
                      {g.level && g.level !== 'null' && <p className="text-[10px] text-neutral-400 mt-0.5">{g.level}</p>}
                    </td>

                    {/* Venue — populated object, show image + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getImg(g.venueId) && (
                          <img src={getImg(g.venueId)} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" onError={e=>e.target.style.display='none'} />
                        )}
                        <span className="text-xs text-neutral-600 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[90px]">
                          {getName(g.venueId)}
                        </span>
                      </div>
                    </td>

                    {/* Sport — populated */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {getName(g.sportId)}
                      </span>
                    </td>

                    {/* Category — populated */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {getName(g.categoryId)}
                      </span>
                    </td>

                    {/* Coach */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-neutral-400" />
                        <span className="text-xs text-neutral-600">{g.coach || '—'}</span>
                      </div>
                    </td>

                    {/* Timing */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-neutral-400" />
                        <span className="text-[10px] text-neutral-500">{g.sportTimingDisplay || g.openingTime || '—'}</span>
                      </div>
                      {g.sportDurationInHours && <p className="text-[10px] text-neutral-300 mt-0.5 pl-4">{g.sportDurationInHours}h</p>}
                    </td>

                    {/* Players */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-neutral-400" />
                        <span className="text-xs text-neutral-600">{g.minPlayers??'—'}–{g.maxPlayers??'—'}</span>
                      </div>
                      {g.isFull && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">Full</span>}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                        {g.sportDateDisplay || (g.sportDate ? new Date(g.sportDate).toLocaleDateString('en-IN') : '—')}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(g)} disabled={togglingId===id}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-60 transition-all
                          ${g.isActive ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                        {togglingId===id ? '...' : g.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewGround(g)} className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { setEditGround(g); setShowForm(true) }} className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteTarget({ id, name: g.name })} className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
              Showing {filtered.length} of {grounds.length} grounds
            </div>
          )}
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-neutral-200 py-14 text-center">
              <MapPin className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
              <p className="text-neutral-400 text-sm">No grounds found</p>
            </div>
          ) : filtered.map(g => {
            const id = g._id || g.id
            return (
              <div key={id} className="bg-white rounded-2xl border border-neutral-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden">
                {g.image
                  ? <img src={g.image} alt={g.name} className="w-full h-36 object-cover" onError={e=>e.target.style.display='none'} />
                  : <div className="w-full h-28 bg-purple-50 flex items-center justify-center"><MapPin className="h-8 w-8 text-purple-300" /></div>
                }
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{g.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{g.sportDateDisplay || '—'}</p>
                    </div>
                    <button onClick={() => handleToggle(g)} disabled={togglingId===id}
                      className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-60 shrink-0
                        ${g.isActive ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {togglingId===id ? '...' : g.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{getName(g.sportId)}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getName(g.venueId)}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{getName(g.categoryId)}</span>
                    {g.isFull && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Full</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-neutral-500 mb-3">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{g.sportTimingDisplay||g.openingTime||'—'}</div>
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" />{g.minPlayers??'—'}–{g.maxPlayers??'—'} players</div>
                    <div className="flex items-center gap-1"><User className="h-3 w-3" />{g.coach||'—'}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{g.sportDurationInHours ? `${g.sportDurationInHours}h` : '—'}</div>
                  </div>

                  {g.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {g.features.map((f,i) => (
                        <span key={i} className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full">{f.title}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-neutral-100">
                    <button onClick={() => setViewGround(g)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-500 border border-blue-200 bg-blue-50 rounded-lg py-1.5 hover:bg-blue-100">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button onClick={() => { setEditGround(g); setShowForm(true) }}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-purple-600 border border-purple-200 bg-purple-50 rounded-lg py-1.5 hover:bg-purple-100">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget({ id, name: g.name })}
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