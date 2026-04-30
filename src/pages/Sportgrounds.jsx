import { useState, useEffect, useRef } from 'react'
import {
  MapPin, Plus, Trash2, Search, LayoutGrid, List,
  Map, Edit, Eye, X, AlertCircle,
  RefreshCw, Clock, Shield, Layers,
  Image as ImageIcon, Upload, CheckCircle, ChevronDown
} from 'lucide-react'
import api from '../api/api'

// ── API calls ─────────────────────────────────────────────────────────────────
const getGrounds   = ()       => api.get('/grounds/getAll')
const createGround = (fd)     => api.post('/grounds/create', fd)
const updateGround = (id, fd) => api.put(`/grounds/update/${id}`, fd)
const deleteGround = (id)     => api.delete(`/grounds/delete/${id}`)
const toggleGround = (id)     => api.patch(`/grounds/${id}/toggle`)
const fetchVenues  = ()       => api.get('/venues/getAll')
const fetchSports  = ()       => api.get('/sports/getAll')
const getAcademyManagers = async () => {
  const res = await api.get('/users/getAll', { params: { role: 'academy_manager' } })
  return res.data
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toList  = (res) => {
  if (Array.isArray(res))                   return res
  if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
  if (Array.isArray(res?.data?.data))       return res.data.data
  if (Array.isArray(res?.data))             return res.data
  return []
}
const getId   = (f) => (typeof f === 'object' && f !== null ? f?._id  : f) || ''
const getName = (f) => (typeof f === 'object' && f !== null ? f?.name : f) || '—'

const getBannerUrl = (b) => {
  if (!b) return null
  if (typeof b === 'string') return b
  return b.image || null
}

const getGroundBanners = (g) => {
  if (!Array.isArray(g.banners) || g.banners.length === 0) return []
  return g.banners.map(getBannerUrl).filter(Boolean)
}

const getGroundSports = (g) => {
  if (Array.isArray(g.sports) && g.sports.length > 0) return g.sports
  if (Array.isArray(g.sportId)) return g.sportId
  if (g.sportId) return [g.sportId]
  return []
}



// ── Styles ────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-400/20 transition-all bg-white'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5'

const STATUS_OPTS = ['available', 'unavailable', 'maintenance']

const emptyForm = {
  venueId: '', sportIds: [], academyId: '', name: '', description: '',
  openingTime: '06:00 AM',
  closingTime:  '06:00 PM',
  status: 'available', isActive: 'true',
}

// ── Multi-Select Sports Dropdown ───────────────────────────────────────────────
function MultiSportSelect({ sports, selected, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const selectedNames = sports
    .filter(s => selected.includes(s._id || s.id))
    .map(s => s.name)

  return (
    <div ref={ref} className="relative">
      <label className={labelCls}>Sports *</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between text-left ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
      >
        <span className={selectedNames.length ? 'text-gray-900' : 'text-gray-400'}>
          {selectedNames.length
            ? selectedNames.length === 1
              ? selectedNames[0]
              : `${selectedNames.length} sports selected`
            : 'Select sports…'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {sports.filter(s => selected.includes(s._id || s.id)).map(s => (
            <span key={s._id || s.id}
              className="flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              {s.name}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s._id || s.id) }}
                className="hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {sports.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No sports available</p>
          ) : sports.map(s => {
            const id = s._id || s.id
            const checked = selected.includes(id)
            return (
              <button key={id} type="button" onClick={() => toggle(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors
                  ${checked ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                  ${checked ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                  {checked && <CheckCircle className="h-3 w-3 text-white" />}
                </span>
                {s.image && (
                  <img src={s.image} alt="" className="w-5 h-5 rounded-full object-cover"
                    onError={e => e.target.style.display = 'none'} />
                )}
                {s.name}
              </button>
            )
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Form Sub-components ───────────────────────────────────────────────────────
function Field({ label, k, type = 'text', ph = '', required = false, form, set, errors, setErrors }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && ' *'}</label>
      <input type={type} placeholder={ph} value={form[k]}
        onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
        className={`${inputCls} ${errors[k] ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`} />
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )
}

// ── Time Field (free text, e.g. "06:00 AM") ───────────────────────────────────
function TimeField({ label, k, required = false, form, set, errors, setErrors }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && ' *'}</label>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="e.g. 06:00 AM"
          value={form[k]}
          onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
          className={`${inputCls} pl-8 ${errors[k] ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
      </div>
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )
}

function DropDown({ label, k, options, ph = 'Select…', required = false, form, set, errors, setErrors }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && ' *'}</label>
      <select value={form[k]}
        onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
        className={`${inputCls} ${errors[k] ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}>
        <option value="">{ph}</option>
        {options.map(o => (
          <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
        ))}
      </select>
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )
}

function SelectField({ label, k, opts, ph = 'Select…', required = false, form, set, errors, setErrors }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && ' *'}</label>
      <select value={form[k]}
        onChange={e => { set(k, e.target.value); setErrors(er => ({ ...er, [k]: '' })) }}
        className={`${inputCls} ${errors[k] ? 'border-red-300' : ''}`}>
        <option value="">{ph}</option>
        {opts.map(o => (
          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )
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
          <h3 className="font-bold text-gray-900 mb-1">Delete Ground?</h3>
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

// ── Sports Tags display ───────────────────────────────────────────────────────
function SportsTags({ sports, max = 3 }) {
  if (!sports || sports.length === 0) return <span className="text-xs text-neutral-400">—</span>
  const visible = sports.slice(0, max)
  const rest    = sports.length - max

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((s, idx) => {
        const name  = getName(s)
        const image = typeof s === 'object' ? s.image : null
        return (
          <span key={s._id || idx}
            className="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {image && (
              <img src={image} alt="" className="w-3 h-3 rounded-full object-cover"
                onError={e => e.target.style.display = 'none'} />
            )}
            {name}
          </span>
        )
      })}
      {rest > 0 && (
        <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
          +{rest}
        </span>
      )}
    </div>
  )
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ ground, onClose, onEdit }) {
  if (!ground) return null

  const sports  = getGroundSports(ground)
  const banners = getGroundBanners(ground)

  const rows = [
    { label: 'Name',          value: ground.name },
    { label: 'Venue',         value: getName(ground.venueId) },
    { label: 'Sports',        value: sports.map(s => getName(s)).join(', ') || '—' },
    { label: 'Academy',       value: getName(ground.academyId) },
    { label: 'Opening Time',  value: ground.openingTime || '—' },
    { label: 'Closing Time',  value: ground.closingTime  || '—' },
    { label: 'No. of Courts', value: ground.noOfCourts ?? '—' },
    { label: 'Status',        value: ground.status || '—' },
    { label: 'Active',        value: ground.isActive ? 'Yes' : 'No' },
    { label: 'Created',       value: ground.createdAt
        ? new Date(ground.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
        : '—' },
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

        {banners.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banners</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {banners.map((url, i) => (
                <img key={i} src={url} alt={`banner-${i}`}
                  className="h-24 w-36 object-cover rounded-xl border border-gray-200 shrink-0"
                  onError={e => e.target.style.display = 'none'} />
              ))}
            </div>
          </div>
        )}

        {sports.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sports</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((s, i) => (
                <div key={s._id || i} className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl">
                  {s.image && (
                    <img src={s.image} alt="" className="w-5 h-5 rounded-full object-cover"
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  <span className="text-xs font-medium text-purple-700 capitalize">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 grid grid-cols-2 gap-2">
          {rows.filter(r => r.label !== 'Sports').map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {ground.description && (
          <div className="px-5 pb-5">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{ground.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Banner Upload Area ────────────────────────────────────────────────────────
function BannerUpload({ banners, setBanners, existingBanners }) {
  const fileRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setBanners(prev => [...prev, ...files])
    e.target.value = ''
  }
  const removeNew = (index) => setBanners(prev => prev.filter((_, i) => i !== index))

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Banners <span className="text-gray-300 font-normal normal-case">(multiple allowed)</span>
      </p>

      {existingBanners?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {existingBanners.map((b, i) => {
            const url = getBannerUrl(b)
            return url ? (
              <div key={i} className="relative group">
                <img src={url} alt="" className="h-20 w-28 object-cover rounded-xl border border-gray-200"
                  onError={e => e.target.style.display = 'none'} />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl transition-all flex items-center justify-center">
                  <span className="text-[9px] text-white font-medium">Existing</span>
                </div>
              </div>
            ) : null
          })}
        </div>
      )}

      {banners.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {banners.map((f, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(f)} alt=""
                className="h-20 w-28 object-cover rounded-xl border border-purple-200" />
              <button onClick={() => removeNew(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <X className="h-3 w-3 text-white" />
              </button>
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-[8px] text-white bg-black/50 rounded px-1 truncate">{f.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div onClick={() => fileRef.current?.click()}
        className="flex items-center gap-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all">
        <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center shrink-0">
          <Upload className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Click to upload banners</p>
          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB each • Multiple files allowed</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {banners.length > 0 && (
        <button onClick={() => setBanners([])} className="text-xs text-red-400 hover:text-red-600 mt-1.5">
          Remove all new banners ({banners.length})
        </button>
      )}
    </div>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function GroundFormModal({ show, editGround, venues, sports, academyOptions, onClose, onSaved, toast }) {
  const [form,    setForm]    = useState(emptyForm)
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  useEffect(() => {
    if (editGround) {
      const rawSports = getGroundSports(editGround)
      const sportIds  = rawSports
        .map(s => (typeof s === 'object' ? s._id : s))
        .filter(Boolean)

      setForm({
        venueId:     getId(editGround.venueId)   || '',
        sportIds,
        academyId:   getId(editGround.academyId) || '',
        name:        editGround.name        || '',
        description: editGround.description || '',
        openingTime: editGround.openingTime || '06:00 AM',
        closingTime: editGround.closingTime || '06:00 PM',
        status:      editGround.status      || 'available',
        isActive:    String(editGround.isActive ?? true),
      })
    } else {
      setForm(emptyForm)
    }
    setBanners([])
    setErrors({})
  }, [editGround, show])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.sportIds?.length) e.sportIds    = 'Select at least one sport'
    if (!form.name.trim())      e.name        = 'Name is required'
    if (!form.openingTime)      e.openingTime = 'Opening time is required'
    if (!form.closingTime)      e.closingTime = 'Closing time is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const fd = new FormData()
    if (form.venueId)   fd.append('venueId',   form.venueId)
    form.sportIds.forEach(id => fd.append('sports', id))
    if (form.academyId) fd.append('academyId', form.academyId)
    fd.append('name',        form.name.trim())
    fd.append('description', form.description.trim())
    // Send as 12h format — change to24h(form.openingTime) if your API expects 24h
    fd.append('openingTime', form.openingTime)
    fd.append('closingTime', form.closingTime)
    fd.append('status',   form.status)
    fd.append('isActive', form.isActive)
    banners.forEach(f => fd.append('banners', f))

    setLoading(true)
    try {
      if (editGround) {
        await updateGround(editGround._id || editGround.id, fd)
        toast('Ground updated successfully!', 'success')
      } else {
        await createGround(fd)
        toast('Ground created successfully!', 'success')
      }
      onSaved(); onClose()
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null
  const fieldProps = { form, set, errors, setErrors }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center
              ${editGround ? 'bg-amber-50 border border-amber-200' : 'bg-purple-50 border border-purple-200'}`}>
              {editGround ? <Edit className="h-4 w-4 text-amber-500" /> : <Plus className="h-4 w-4 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{editGround ? 'Edit Ground' : 'Add New Ground'}</h2>
              <p className="text-xs text-gray-400">* required fields</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Section 1: Linked References */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Linked References</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <DropDown
                label="Venue"
                k="venueId"
                options={venues}
                ph="Select venue (optional)"
                {...fieldProps}
              />

              <div className="sm:col-span-2">
                <MultiSportSelect sports={sports} selected={form.sportIds}
                  onChange={(ids) => { set('sportIds', ids); setErrors(er => ({ ...er, sportIds: '' })) }}
                  error={errors.sportIds} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Academy</label>
                <select value={form.academyId} onChange={e => set('academyId', e.target.value)} className={inputCls}>
                  <option value="">Academy (optional)</option>
                  {academyOptions.map(o => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Basic Info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Field label="Name" k="name" ph="e.g. Cricket Ground 1" required {...fieldProps} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short description of the ground…"
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* Section 3: Timing */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Timing</p>
            <div className="grid grid-cols-2 gap-3">
              <TimeField label="Opening Time" k="openingTime" required {...fieldProps} />
              <TimeField label="Closing Time" k="closingTime" required {...fieldProps} />
            </div>
          </div>

          {/* Section 4: Settings */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Settings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField label="Status" k="status" opts={STATUS_OPTS} ph="Select status" {...fieldProps} />
              <div>
                <label className={labelCls}>Is Active</label>
                <select value={form.isActive} onChange={e => set('isActive', e.target.value)} className={inputCls}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Banners */}
          <BannerUpload banners={banners} setBanners={setBanners} existingBanners={editGround?.banners} />
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
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

  const [grounds,         setGrounds]         = useState([])
  const [venues,          setVenues]          = useState([])
  const [sports,          setSports]          = useState([])
  const [academyManagers, setAcademyManagers] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [viewMode,        setViewMode]        = useState('table')
  const [showForm,        setShowForm]        = useState(false)
  const [editGround,      setEditGround]      = useState(null)
  const [viewGround,      setViewGround]      = useState(null)
  const [deleteTarget,    setDeleteTarget]    = useState(null)
  const [deleting,        setDeleting]        = useState(false)
  const [togglingId,      setTogglingId]      = useState(null)

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
    const [vR, sR, amR] = await Promise.allSettled([fetchVenues(), fetchSports(), getAcademyManagers()])
    if (vR.status  === 'fulfilled') setVenues(toList(vR.value))
    if (sR.status  === 'fulfilled') setSports(toList(sR.value))
    if (amR.status === 'fulfilled') setAcademyManagers(toList(amR.value))
  }

  const academyOptions = academyManagers
    .map(u => ({
      _id:  u.academyId || '',
      name: u.academy?.name || u.email || u._id || 'Unknown',
    }))
    .filter(o => o._id)

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
      setGrounds(prev => prev.map(g => (g._id||g.id) === id ? { ...g, isActive: !g.isActive } : g))
      toast(`Marked ${ground.isActive ? 'Inactive' : 'Active'}`, 'success')
    } catch {
      try {
        const fd = new FormData(); fd.append('isActive', String(!ground.isActive))
        await updateGround(id, fd)
        setGrounds(prev => prev.map(g => (g._id||g.id) === id ? { ...g, isActive: !g.isActive } : g))
        toast(`Marked ${ground.isActive ? 'Inactive' : 'Active'}`, 'success')
      } catch (e2) { toast(e2.message || 'Toggle failed', 'error') }
    } finally { setTogglingId(null) }
  }

  const filtered = grounds.filter(g => {
    const q = search.toLowerCase()
    const sportsStr = getGroundSports(g).map(s => getName(s)).join(' ')
    return (
      g.name?.toLowerCase().includes(q) ||
      g.status?.toLowerCase().includes(q) ||
      getName(g.venueId).toLowerCase().includes(q) ||
      sportsStr.toLowerCase().includes(q)
    )
  })

  const activeCount = grounds.filter(g => g.isActive).length
  const stats = [
    { label: 'Total Grounds', value: grounds.length,               sub: `${activeCount} active`, icon: Map,    color: 'bg-purple-600' },
    { label: 'Active',        value: activeCount,                  sub: 'available now',          icon: Shield, color: 'bg-green-600'  },
    { label: 'Inactive',      value: grounds.length - activeCount, sub: 'not available',          icon: Layers, color: 'bg-neutral-600'},
    { label: 'Venues',        value: new Set(grounds.map(g => getId(g.venueId))).size, sub: 'linked', icon: MapPin, color: 'bg-black' },
  ]

  const statusColor = (s) => {
    if (s === 'available')   return 'bg-green-50 text-green-700'
    if (s === 'unavailable') return 'bg-red-50 text-red-600'
    if (s === 'maintenance') return 'bg-amber-50 text-amber-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <ConfirmModal show={!!deleteTarget} name={deleteTarget?.name} loading={deleting}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

      <ViewModal ground={viewGround} onClose={() => setViewGround(null)}
        onEdit={g => { setEditGround(g); setShowForm(true) }} />

      <GroundFormModal
        show={showForm} editGround={editGround}
        venues={venues} sports={sports} academyOptions={academyOptions}
        onClose={() => { setShowForm(false); setEditGround(null) }}
        onSaved={fetchAll} toast={toast}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Grounds</h1>
          </div>
          <p className="text-neutral-500 text-sm">Manage all sport grounds — venue & sport linked</p>
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
          <input type="text" placeholder="Search name, type, venue, sport..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
          {search && (
            <button onClick={() => setSearch('')} className="text-neutral-300 hover:text-neutral-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <span className="text-xs text-neutral-400 ml-auto">
          {filtered.length} ground{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex bg-neutral-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}>
            <List className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['#','Banner','Name','Academy','Sports','Timing','Status','Active','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-14 text-neutral-400 text-sm">
                    <MapPin className="h-7 w-7 mx-auto mb-2 text-neutral-200" />No grounds found
                  </td></tr>
                ) : filtered.map((g, i) => {
                  const id      = g._id || g.id
                  const banners = getGroundBanners(g)
                  const gSports = getGroundSports(g)

                  return (
                    <tr key={id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                      <td className="px-4 py-3 text-neutral-400 text-xs">{i + 1}</td>

                      <td className="px-4 py-3">
                        {banners[0]
                          ? <img src={banners[0]} alt={g.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              onError={e => e.target.style.display = 'none'} />
                          : <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-purple-400" />
                            </div>
                        }
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-black">{g.name}</p>
                        {g.description && (
                          <p className="text-[10px] text-neutral-400 mt-0.5 max-w-[120px] truncate">{g.description}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {typeof g.academyId === 'object' && g.academyId?.image && (
                            <img src={g.academyId.image} alt="" className="w-5 h-5 rounded object-cover shrink-0"
                              onError={e => e.target.style.display = 'none'} />
                          )}
                          <span className="text-xs text-neutral-600 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[90px]">
                            {getName(g.academyId)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[160px]">
                        <SportsTags sports={gSports} max={3} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                            {g.openingTime && g.closingTime ? `${g.openingTime} – ${g.closingTime}` : g.openingTime || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColor(g.status)}`}>
                          {g.status || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(g)} disabled={togglingId === id}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-60 transition-all
                            ${g.isActive ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                          {togglingId === id ? '...' : g.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewGround(g)}
                            className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { setEditGround(g); setShowForm(true) }}
                            className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id, name: g.name })}
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
          </div>
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
            const id      = g._id || g.id
            const banners = getGroundBanners(g)
            const gSports = getGroundSports(g)

            return (
              <div key={id} className="bg-white rounded-2xl border border-neutral-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden">
                {banners[0]
                  ? <img src={banners[0]} alt={g.name} className="w-full h-36 object-cover"
                      onError={e => e.target.style.display = 'none'} />
                  : <div className="w-full h-28 bg-purple-50 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-purple-300" />
                    </div>
                }
                {banners.length > 1 && (
                  <div className="-mt-6 px-3 flex justify-end">
                    <span className="text-[9px] bg-black/60 text-white px-2 py-0.5 rounded-full">
                      +{banners.length - 1} more
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{g.name}</p>
                    </div>
                    <button onClick={() => handleToggle(g)} disabled={togglingId === id}
                      className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-60 shrink-0
                        ${g.isActive ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {togglingId === id ? '...' : g.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="mb-2">
                    <SportsTags sports={gSports} max={4} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getName(g.venueId)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusColor(g.status)}`}>
                      {g.status || 'unknown'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 mb-3">
                    <Clock className="h-3 w-3" />
                    {g.openingTime || '—'} – {g.closingTime || '—'}
                  </div>

                  {g.description && (
                    <p className="text-[10px] text-neutral-400 mb-3 line-clamp-2">{g.description}</p>
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