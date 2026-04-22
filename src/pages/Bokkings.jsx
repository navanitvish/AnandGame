// Bookings.jsx
// White bg · purple accents · black text
// GET  /bookings/getAll?page=1&limit=10&status=&paymentStatus=&fromDate=&toDate=&sortBy=createdAt&sortOrder=desc
// PUT  /bookings/:id  → update status / paymentStatus

import { useState, useEffect, useCallback } from 'react'
import {
  Search, X, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Clock, MapPin, User, Edit, CheckCircle,
  XCircle, AlertCircle, Loader2, Eye, CreditCard,
  Hash, Building2, Activity, Download, Filter,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { getBookings, updateBooking } from '../api/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS         = ['pending', 'confirmed', 'cancelled', 'completed']
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

const STATUS_STYLE = {
  pending:   'bg-amber-50   text-amber-700   border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50     text-red-700     border-red-200',
  completed: 'bg-blue-50    text-blue-700    border-blue-200',
}
const PAYMENT_STYLE = {
  pending:  'bg-amber-50   text-amber-700   border-amber-200',
  paid:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:   'bg-red-50     text-red-700     border-red-200',
  refunded: 'bg-purple-50  text-purple-700  border-purple-200',
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Helpers ──────────────────────────────────────────────────────────────────
// userId can have: name, email, mobile, role
const userName  = (u) => u?.name  || u?.email || u?.mobile || '—'
const userSub   = (u) => u?.email || u?.mobile || ''
const userInitial = (u) => (u?.name || u?.email || u?.mobile || '?')[0]?.toUpperCase()

// sportGroundId is populated: { _id, name, venueId:{}, sportId:{}, categoryId:{}, sportDurationInHours }
const sg    = (b) => b.sportGroundId || {}
const venue = (b) => sg(b).venueId   || {}
const sport = (b) => sg(b).sportId   || {}
const cat   = (b) => sg(b).categoryId || {}

// ─── CSV Export ───────────────────────────────────────────────────────────────
const downloadCSV = (data, filename = 'bookings.csv') => {
  if (!data.length) return
  const rows = data.map(b => ({
    ID:            b._id,
    User:          userName(b.userId),
    Mobile:        b.userId?.mobile || '—',
    Email:         b.userId?.email  || '—',
    Role:          b.userId?.role   || '—',
    Venue:         venue(b).name    || '—',
    Ground:        sg(b).name       || '—',
    Sport:         sport(b).name    || '—',
    Category:      cat(b).name      || '—',
    StartTime:     fmtTime(b.startTime),
    EndTime:       fmtTime(b.endTime),
    Date:          fmtDate(b.startTime),
    Duration:      sg(b).sportDurationInHours ? `${sg(b).sportDurationInHours}h` : '—',
    Status:        b.status,
    PaymentStatus: b.paymentStatus,
    CreatedAt:     fmtDate(b.createdAt),
  }))
  const headers = Object.keys(rows[0]).join(',')
  const body    = rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n')
  const blob    = new Blob([headers + '\n' + body], { type: 'text/csv' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, className }) => (
  <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize ${className}`}>
    {label}
  </span>
)

// ─── Section / Row (used in modals) ──────────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <div className="rounded-xl border border-neutral-200 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
      {icon}
      <span className="text-xs font-bold text-black uppercase tracking-wide">{title}</span>
    </div>
    <div className="px-4 py-3 space-y-2.5">{children}</div>
  </div>
)

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 text-xs">
    <span className="text-neutral-400 flex-shrink-0 mt-0.5">{label}</span>
    <span className="font-medium text-black text-right">{value}</span>
  </div>
)

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ booking: b, onClose, onEdit, onVerify, onCancel }) => {
  const u = b.userId || {}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black">Booking Details</h2>
              <p className="text-[10px] text-neutral-400 font-mono">#{b._id.slice(-10).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); onEdit(b) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 text-xs font-semibold transition-all">
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => downloadCSV([b], `booking-${b._id.slice(-6)}.csv`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-all">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <Badge label={b.status}        className={STATUS_STYLE[b.status]  || 'bg-gray-100 text-gray-500 border-gray-200'} />
          <Badge label={b.paymentStatus} className={PAYMENT_STYLE[b.paymentStatus] || 'bg-gray-100 text-gray-500 border-gray-200'} />
          <span className="text-xs text-neutral-400 ml-auto">Created {fmtDate(b.createdAt)}</span>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">

          {/* Venue image */}
          {venue(b).image && (
            <div className="rounded-xl overflow-hidden border border-neutral-200 h-40 w-full">
              <img src={venue(b).image} alt={venue(b).name} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Venue & Ground */}
          <Section title="Venue & Ground" icon={<Building2 className="h-4 w-4 text-purple-600" />}>
            <Row label="Venue"    value={venue(b).name || '—'} />
            <Row label="Ground"   value={sg(b).name    || '—'} />
            <Row label="Category" value={cat(b).name   || '—'} />
            {venue(b).description && (
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Description</span>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{venue(b).description}</p>
              </div>
            )}
          </Section>

          {/* Sport */}
          <Section title="Sport" icon={<Activity className="h-4 w-4 text-emerald-600" />}>
            <div className="flex items-center gap-3">
              {sport(b).image && (
                <img src={sport(b).image} alt={sport(b).name}
                  className="h-10 w-10 rounded-xl object-cover border border-neutral-200 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-black">{sport(b).name || '—'}</p>
                {sport(b).description && <p className="text-xs text-neutral-500 mt-0.5">{sport(b).description}</p>}
              </div>
            </div>
            <Row label="Duration" value={sg(b).sportDurationInHours ? `${sg(b).sportDurationInHours} hour(s)` : '—'} />
          </Section>

          {/* Schedule */}
          <Section title="Schedule" icon={<Calendar className="h-4 w-4 text-blue-600" />}>
            <Row label="Sport Date" value={fmtDate(sg(b).sportDate)} />
            <Row label="Start Time" value={fmtTime(b.startTime)} />
            <Row label="End Time"   value={fmtTime(b.endTime)} />
            <Row label="Full Slot"  value={`${fmt(b.startTime)} – ${fmtTime(b.endTime)}`} />
          </Section>

          {/* User */}
          <Section title="User" icon={<User className="h-4 w-4 text-amber-600" />}>
            {u.name   && <Row label="Name"   value={u.name} />}
            {u.email  && <Row label="Email"  value={u.email} />}
            {u.mobile && <Row label="Mobile" value={u.mobile} />}
            <Row label="Role" value={
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'
              }`}>{u.role || '—'}</span>
            } />
          </Section>

          {/* IDs */}
          <Section title="Reference IDs" icon={<Hash className="h-4 w-4 text-neutral-400" />}>
            <Row label="Booking ID" value={<span className="font-mono text-xs break-all">{b._id}</span>} />
            <Row label="User ID"    value={<span className="font-mono text-xs">{u._id || '—'}</span>} />
            <Row label="Ground ID"  value={<span className="font-mono text-xs">{sg(b)._id || '—'}</span>} />
          </Section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-neutral-100 flex gap-2 flex-wrap">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 min-w-[80px]">
            Close
          </button>
          {b.status === 'pending' && (
            <>
              <button onClick={() => { onVerify(b._id); onClose() }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Verify
              </button>
              <button onClick={() => { onCancel(b._id); onClose() }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200">
                <XCircle className="h-3.5 w-3.5" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Update Modal ─────────────────────────────────────────────────────────────
const UpdateModal = ({ booking: b, onClose, onSaved }) => {
  const [status,        setStatus]        = useState(b.status)
  const [paymentStatus, setPaymentStatus] = useState(b.paymentStatus)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      await updateBooking(b._id, { status, paymentStatus })
      onSaved({ ...b, status, paymentStatus })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update booking')
    } finally {
      setLoading(false)
    }
  }

  const hasChanged = status !== b.status || paymentStatus !== b.paymentStatus

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Edit className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black">Update Booking</h2>
              <p className="text-[10px] text-neutral-400 font-mono">#{b._id.slice(-10).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Venue</span>
              <span className="font-semibold text-black">{venue(b).name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Ground</span>
              <span className="font-semibold text-black">{sg(b).name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Sport</span>
              <span className="font-semibold text-black">{sport(b).name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">User</span>
              <span className="font-semibold text-black">{userName(b.userId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Slot</span>
              <span className="font-semibold text-black">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</span>
            </div>
          </div>

          {/* Current badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Current:</span>
            <Badge label={b.status}        className={STATUS_STYLE[b.status]  || ''} />
            <Badge label={b.paymentStatus} className={PAYMENT_STYLE[b.paymentStatus] || ''} />
          </div>

          {/* Booking Status */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Booking Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    status === s
                      ? (STATUS_STYLE[s] || '') + ' ring-2 ring-offset-1 ring-purple-400'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => setPaymentStatus(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    paymentStatus === s
                      ? (PAYMENT_STYLE[s] || '') + ' ring-2 ring-offset-1 ring-purple-400'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} disabled={loading}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading || !hasChanged}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-purple-200">
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CheckCircle className="h-4 w-4" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Booking Card ──────────────────────────────────────────────────────
const BookingCard = ({ b, onView, onEdit }) => (
  <div className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50 transition-all">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs font-mono text-neutral-400">#{b._id.slice(-8).toUpperCase()}</p>
        <p className="text-sm font-bold text-black mt-0.5">{sg(b).name || '—'}</p>
        <p className="text-xs text-neutral-500">{venue(b).name || '—'}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onView(b)}
          className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all">
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onEdit(b)}
          className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all">
          <Edit className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
      <div className="flex items-center gap-1.5 text-neutral-500">
        <User className="h-3.5 w-3.5 text-neutral-400" />
        {userName(b.userId)}
      </div>
      <div className="flex items-center gap-1.5 text-neutral-500">
        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
        {sport(b).name || '—'}
      </div>
      <div className="flex items-center gap-1.5 text-neutral-500">
        <Clock className="h-3.5 w-3.5 text-neutral-400" />
        {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
      </div>
      <div className="flex items-center gap-1.5 text-neutral-500">
        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
        {fmtDate(b.startTime)}
      </div>
    </div>
    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 flex-wrap">
      <Badge label={b.status}        className={STATUS_STYLE[b.status]  || ''} />
      <Badge label={b.paymentStatus} className={PAYMENT_STYLE[b.paymentStatus] || ''} />
    </div>
  </div>
)

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Bookings() {
  const [bookings,       setBookings]       = useState([])
  const [meta,           setMeta]           = useState({ total: 0, totalPages: 1, page: 1 })
  const [search,         setSearch]         = useState('')
  const [page,           setPage]           = useState(1)
  const [limit]                             = useState(10)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [viewingBooking, setViewingBooking] = useState(null)
  const [editingBooking, setEditingBooking] = useState(null)

  // ── Advanced filter state (sent as API query params) ──────────────────────
  const [statusFilter,       setStatusFilter]       = useState('')
  const [paymentFilter,      setPaymentFilter]       = useState('')
  const [fromDate,           setFromDate]            = useState('')
  const [toDate,             setToDate]              = useState('')
  const [sortBy,             setSortBy]              = useState('createdAt')
  const [sortOrder,          setSortOrder]           = useState('desc')
  const [showAdvanced,       setShowAdvanced]        = useState(false)

  // ── Client-side text search (on top of server results) ───────────────────
  const [clientSearch, setClientSearch] = useState('')

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (pg = 1) => {
    setLoading(true); setError('')
    try {
      const params = {
        page: pg, limit,
        ...(statusFilter  && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
        ...(fromDate      && { fromDate }),
        ...(toDate        && { toDate }),
        sortBy, sortOrder,
      }
      const res = await getBookings(pg, limit, search, params)
      // API shape: { data: { total, totalPages, page, limit, data: [...] } }
      const d = res?.data || res
      setBookings(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [])
      setMeta({
        total:      d?.total      || 0,
        totalPages: d?.totalPages || 1,
        page:       d?.page       || pg,
      })
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, paymentFilter, fromDate, toDate, sortBy, sortOrder, limit])

  useEffect(() => { fetchBookings(1) }, []) // eslint-disable-line

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBookings(1) }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  const applyFilters = () => { setPage(1); fetchBookings(1) }

  const clearFilters = () => {
    setStatusFilter(''); setPaymentFilter(''); setFromDate(''); setToDate('')
    setSortBy('createdAt'); setSortOrder('desc')
    setTimeout(() => fetchBookings(1), 50)
  }

  const handlePageChange = (p) => { setPage(p); fetchBookings(p) }

  const handleSaved = (updated) =>
    setBookings(prev => prev.map(b => b._id === updated._id ? updated : b))

  // optimistic verify / cancel
  const handleVerify = (id) =>
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'confirmed' } : b))

  const handleCancel = (id) =>
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))

  // ── Client-side text filter on top of server data ──────────────────────────
  const displayBookings = clientSearch
    ? bookings.filter(b => {
        const q = clientSearch.toLowerCase()
        return (
          userName(b.userId).toLowerCase().includes(q) ||
          (b.userId?.mobile || '').includes(q) ||
          (b.userId?.email  || '').toLowerCase().includes(q) ||
          (venue(b).name    || '').toLowerCase().includes(q) ||
          (sg(b).name       || '').toLowerCase().includes(q) ||
          (sport(b).name    || '').toLowerCase().includes(q)
        )
      })
    : bookings

  // ── Stats ──────────────────────────────────────────────────────────────────
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length

  const hasActiveFilters = statusFilter || paymentFilter || fromDate || toDate

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">

      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 p-7">
        <div className="pointer-events-none absolute -top-10 right-20 h-48 w-48 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-4  h-32 w-32 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Data</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-1">Bookings</h1>
            <p className="text-sm text-neutral-500">Manage all sport ground bookings</p>

            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm font-semibold">
              <span className="flex items-center gap-2 text-black">
                <Calendar className="h-4 w-4 text-purple-600" /> {meta.total} Total
              </span>
              <span className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" /> {pending} Pending
              </span>
              <span className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" /> {confirmed} Confirmed
              </span>
              <span className="flex items-center gap-2 text-red-500">
                <XCircle className="h-4 w-4" /> {cancelled} Cancelled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => downloadCSV(displayBookings)}
              disabled={!displayBookings.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 text-sm font-medium transition-all disabled:opacity-50">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => downloadCSV(displayBookings.filter(b => b.status === 'pending'), 'pending-bookings.csv')}
              disabled={!displayBookings.filter(b => b.status === 'pending').length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-all disabled:opacity-50">
              <Download className="h-4 w-4" /> Pending Only
            </button>
            <button onClick={() => fetchBookings(page)}
              className="p-2.5 rounded-xl border border-purple-200 bg-white text-purple-600 hover:bg-purple-100 transition-all">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters Card ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">

        {/* Top row: search + quick status + advanced toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Client-side search */}
          <div className="relative min-w-48 flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name, venue, sport…"
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400
                         focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
            />
            {clientSearch && (
              <button onClick={() => setClientSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick status pills */}
          <div className="flex gap-1.5 flex-wrap">
            {['', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
              <button key={s}
                onClick={() => { setStatusFilter(s); setTimeout(() => fetchBookings(1), 50) }}
                className={`text-xs font-medium px-3 py-2 rounded-full border transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-purple-300'
                }`}>
                {s || 'All'}
              </button>
            ))}
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`ml-auto flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
              hasActiveFilters
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}>
            <Filter className="h-3.5 w-3.5" />
            Filters {hasActiveFilters ? '(active)' : ''}
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="pt-4 border-t border-neutral-100 space-y-4">
            <div className="flex flex-wrap gap-3">
              {/* Payment Status */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">Payment Status</label>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white min-w-[140px]">
                  <option value="">All Payments</option>
                  {PAYMENT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400" />
              </div>

              {/* To Date */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400" />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white min-w-[130px]">
                  <option value="createdAt">Created At</option>
                  <option value="startTime">Start Time</option>
                  <option value="endTime">End Time</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">Order</label>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={applyFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result count */}
        <div className="flex justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3">
          <span>
            Showing {displayBookings.length} of {meta.total} bookings
            {clientSearch && ` (filtered by "${clientSearch}")`}
          </span>
          <span>Page {meta.page} of {meta.totalPages}</span>
        </div>
      </div>

      {/* ── Main Table Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-5">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => fetchBookings(page)}
              className="text-xs text-red-500 hover:text-red-700 font-semibold underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <p className="text-sm text-neutral-400">Loading bookings…</p>
          </div>

        ) : displayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-black">No bookings found</p>
            <p className="text-xs text-neutral-400 mt-1">Try changing your filters or search.</p>
          </div>

        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-neutral-200 overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['#', 'User', 'Venue / Ground', 'Sport / Category', 'Time Slot', 'Date', 'Duration', 'Status', 'Payment', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayBookings.map((b, i) => {
                    const u = b.userId || {}
                    return (
                      <tr key={b._id} className="border-b border-neutral-100 hover:bg-purple-50/40 transition-colors">

                        {/* # */}
                        <td className="px-4 py-3 font-mono text-xs text-neutral-400 whitespace-nowrap">
                          #{b._id.slice(-8).toUpperCase()}
                        </td>

                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                              {userInitial(u)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-black leading-snug">{u.name || '—'}</p>
                              <p className="text-[11px] text-neutral-400">{u.email || u.mobile || ''}</p>
                              <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'
                              }`}>{u.role || '—'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Venue / Ground */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-black leading-snug">{venue(b).name || '—'}</p>
                          <p className="text-[11px] text-neutral-400">{sg(b).name || '—'}</p>
                        </td>

                        {/* Sport / Category */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {sport(b).image && (
                              <img src={sport(b).image} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0"
                                onError={e => e.target.style.display = 'none'} />
                            )}
                            <div>
                              <p className="text-xs font-medium text-black">{sport(b).name || '—'}</p>
                              <p className="text-[10px] text-neutral-400">{cat(b).name || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Time Slot */}
                        <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">
                          {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                          {fmtDate(b.startTime)}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                          {sg(b).sportDurationInHours ? `${sg(b).sportDurationInHours}h` : '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge label={b.status} className={STATUS_STYLE[b.status] || 'bg-neutral-50 text-neutral-500 border-neutral-200'} />
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3">
                          <Badge label={b.paymentStatus} className={PAYMENT_STYLE[b.paymentStatus] || 'bg-neutral-50 text-neutral-500 border-neutral-200'} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setViewingBooking(b)} title="View details"
                              className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setEditingBooking(b)} title="Update status"
                              className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => downloadCSV([b], `booking-${b._id.slice(-6)}.csv`)} title="Download CSV"
                              className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            {b.status === 'pending' && (
                              <button onClick={() => handleVerify(b._id)} title="Verify booking"
                                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all">
                                <CheckCircle className="h-3 w-3" /> Verify
                              </button>
                            )}
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <button onClick={() => handleCancel(b._id)} title="Cancel booking"
                                className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-all">
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {displayBookings.map(b => (
                <BookingCard key={b._id} b={b}
                  onView={setViewingBooking} onEdit={setEditingBooking} />
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-500
                             hover:text-black hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, idx) =>
                      p === '…' ? (
                        <span key={`e-${idx}`} className="px-2 text-neutral-400 text-sm">…</span>
                      ) : (
                        <button key={p} onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                            p === meta.page
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                              : 'border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50'
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                </div>

                <button onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-500
                             hover:text-black hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {viewingBooking && (
        <ViewModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onEdit={b => { setViewingBooking(null); setEditingBooking(b) }}
          onVerify={handleVerify}
          onCancel={handleCancel}
        />
      )}
      {editingBooking && (
        <UpdateModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}