// Bookings.jsx
// White bg · purple accents · black text
// GET  /bookings/getAll?page=1&limit=10
// PUT  /bookings/:id  → update status / paymentStatus
// View modal + Update modal

import { useState, useEffect, useCallback } from 'react'
import {
  Search, X, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Clock, MapPin, User, Edit, CheckCircle,
  XCircle, AlertCircle, Loader2, Eye, Tag, CreditCard,
  Hash, Building2, Activity,
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
  pending:  'bg-amber-50   text-amber-700  border-amber-200',
  paid:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:   'bg-red-50     text-red-700    border-red-200',
  refunded: 'bg-purple-50  text-purple-700 border-purple-200',
}

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—'

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

const Badge = ({ label, className }) => (
  <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize ${className}`}>
    {label}
  </span>
)

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ booking, onClose, onEdit }) => {
  const sg   = booking.sportGroundId || {}
  const user = booking.userId || {}
  const venue = sg.venueId || {}
  const sport = sg.sportId || {}
  const cat   = sg.categoryId || {}

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
              <p className="text-[10px] text-neutral-400 font-mono">#{booking._id.slice(-10).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onEdit(booking) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 text-xs font-semibold transition-all"
            >
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">

          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge label={booking.status}        className={STATUS_STYLE[booking.status]  || ''} />
            <Badge label={booking.paymentStatus} className={PAYMENT_STYLE[booking.paymentStatus] || ''} />
            <span className="text-xs text-neutral-400 ml-auto">Created {fmt(booking.createdAt)}</span>
          </div>

          {/* Venue image */}
          {venue.image && (
            <div className="rounded-xl overflow-hidden border border-neutral-200 h-40 w-full">
              <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Section: Venue & Ground */}
          <Section title="Venue & Ground" icon={<Building2 className="h-4 w-4 text-purple-600" />}>
            <Row label="Venue"    value={venue.name || '—'} />
            <Row label="Ground"   value={sg.name    || '—'} />
            <Row label="Category" value={cat.name   || '—'} />
            {venue.description && (
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Description</span>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{venue.description}</p>
              </div>
            )}
          </Section>

          {/* Section: Sport */}
          <Section title="Sport" icon={<Activity className="h-4 w-4 text-emerald-600" />}>
            <div className="flex items-center gap-3">
              {sport.image && (
                <img src={sport.image} alt={sport.name} className="h-10 w-10 rounded-xl object-cover border border-neutral-200 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-black">{sport.name || '—'}</p>
                {sport.description && <p className="text-xs text-neutral-500 mt-0.5">{sport.description}</p>}
              </div>
            </div>
            <Row label="Duration" value={sg.sportDurationInHours ? `${sg.sportDurationInHours} hour(s)` : '—'} />
          </Section>

          {/* Section: Schedule */}
          <Section title="Schedule" icon={<Calendar className="h-4 w-4 text-blue-600" />}>
            <Row label="Sport Date" value={fmtDate(sg.sportDate)} />
            <Row label="Start Time" value={fmtTime(booking.startTime)} />
            <Row label="End Time"   value={fmtTime(booking.endTime)} />
            <Row label="Full Slot"  value={`${fmt(booking.startTime)} – ${fmtTime(booking.endTime)}`} />
          </Section>

          {/* Section: User */}
          <Section title="User" icon={<User className="h-4 w-4 text-amber-600" />}>
            {user.name  && <Row label="Name"   value={user.name} />}
            {user.email && <Row label="Email"  value={user.email} />}
            {user.mobile && <Row label="Mobile" value={user.mobile} />}
            <Row label="Role" value={
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'
              }`}>{user.role || '—'}</span>
            } />
          </Section>

          {/* Section: IDs */}
          <Section title="Reference IDs" icon={<Hash className="h-4 w-4 text-neutral-400" />}>
            <Row label="Booking ID" value={<span className="font-mono text-xs">{booking._id}</span>} />
            <Row label="User ID"    value={<span className="font-mono text-xs">{user._id || '—'}</span>} />
            <Row label="Ground ID"  value={<span className="font-mono text-xs">{sg._id || '—'}</span>} />
          </Section>
        </div>
      </div>
    </div>
  )
}

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

// ─── Update Modal ─────────────────────────────────────────────────────────────
const UpdateModal = ({ booking, onClose, onSaved }) => {
  const [status,        setStatus]        = useState(booking.status)
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  const sg   = booking.sportGroundId || {}
  const user = booking.userId || {}

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      await updateBooking(booking._id, { status, paymentStatus })
      onSaved({ ...booking, status, paymentStatus })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update booking')
    } finally {
      setLoading(false)
    }
  }

  const hasChanged = status !== booking.status || paymentStatus !== booking.paymentStatus

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
              <p className="text-[10px] text-neutral-400 font-mono">#{booking._id.slice(-10).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
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
              <span className="font-semibold text-black">{sg.venueId?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Ground</span>
              <span className="font-semibold text-black">{sg.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Sport</span>
              <span className="font-semibold text-black">{sg.sportId?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">User</span>
              <span className="font-semibold text-black">{user.name || user.email || user.mobile || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Slot</span>
              <span className="font-semibold text-black">{fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</span>
            </div>
          </div>

          {/* Current badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Current:</span>
            <Badge label={booking.status}        className={STATUS_STYLE[booking.status]  || ''} />
            <Badge label={booking.paymentStatus} className={PAYMENT_STYLE[booking.paymentStatus] || ''} />
          </div>

          {/* Booking Status */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Booking Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    status === s
                      ? STATUS_STYLE[s] + ' ring-2 ring-offset-1 ring-purple-400'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
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
                <button
                  key={s}
                  onClick={() => setPaymentStatus(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    paymentStatus === s
                      ? PAYMENT_STYLE[s] + ' ring-2 ring-offset-1 ring-purple-400'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !hasChanged}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-purple-200"
          >
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

// ─── Booking Card (mobile) ────────────────────────────────────────────────────
const BookingCard = ({ booking, onView, onEdit }) => {
  const sg   = booking.sportGroundId || {}
  const user = booking.userId || {}
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-neutral-400">#{booking._id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-bold text-black mt-0.5">{sg.name || '—'}</p>
          <p className="text-xs text-neutral-500">{sg.venueId?.name || '—'}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(booking)}
            className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(booking)}
            className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <User className="h-3.5 w-3.5 text-neutral-400" />
          {user.name || user.mobile || user.email || 'User'}
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
          {sg.sportId?.name || '—'}
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          {fmtDate(booking.startTime)}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 flex-wrap">
        <Badge label={booking.status}        className={STATUS_STYLE[booking.status]  || ''} />
        <Badge label={booking.paymentStatus} className={PAYMENT_STYLE[booking.paymentStatus] || ''} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const fetchBookings = useCallback(async (pg = page, q = search) => {
    setLoading(true); setError('')
    try {
      const res = await getBookings(pg, limit, q)
      const d   = res?.data || res
      setBookings(d?.data    || [])
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
  }, [page, search, limit])

  useEffect(() => { fetchBookings(1, '') }, []) // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBookings(1, search) }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  const handlePageChange = (p) => { setPage(p); fetchBookings(p, search) }

  const handleSaved = (updated) =>
    setBookings((prev) => prev.map((b) => b._id === updated._id ? updated : b))

  const pending   = bookings.filter((b) => b.status === 'pending').length
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">

      {/* ── Header Banner ──────────────────────────── */}
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

          <button
            onClick={() => fetchBookings(page, search)}
            className="p-2.5 rounded-xl border border-purple-200 bg-white text-purple-600 hover:bg-purple-100 transition-all self-start"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Card ──────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search venue, ground, user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400
                         focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-400 flex-shrink-0">
            Page {meta.page} of {meta.totalPages} &nbsp;·&nbsp; {meta.total} bookings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => fetchBookings(page, search)} className="text-xs text-red-500 hover:text-red-700 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <p className="text-sm text-neutral-400">Loading bookings…</p>
          </div>

        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-black">No bookings found</p>
            <p className="text-xs text-neutral-400 mt-1">
              {search ? 'Try a different search.' : 'No bookings have been made yet.'}
            </p>
          </div>

        ) : (
          <>
            {/* ── Desktop Table ──────────────────────── */}
            <div className="hidden md:block rounded-xl border border-neutral-200 overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['ID', 'User', 'Venue / Ground', 'Sport', 'Time Slot', 'Date', 'Status', 'Payment', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const sg   = b.sportGroundId || {}
                    const user = b.userId        || {}
                    return (
                      <tr key={b._id} className="border-b border-neutral-100 hover:bg-purple-50/40 transition-colors group">
                        <td className="px-4 py-3 font-mono text-xs text-neutral-400 whitespace-nowrap">
                          #{b._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-black leading-snug">{user.name || '—'}</p>
                          <p className="text-[11px] text-neutral-400">{user.email || user.mobile || ''}</p>
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'
                          }`}>{user.role || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-black leading-snug">{sg.venueId?.name || '—'}</p>
                          <p className="text-[11px] text-neutral-400">{sg.name || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">{sg.sportId?.name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">
                          {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{fmtDate(b.startTime)}</td>
                        <td className="px-4 py-3">
                          <Badge label={b.status} className={STATUS_STYLE[b.status] || 'bg-neutral-50 text-neutral-500 border-neutral-200'} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={b.paymentStatus} className={PAYMENT_STYLE[b.paymentStatus] || 'bg-neutral-50 text-neutral-500 border-neutral-200'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setViewingBooking(b)}
                              title="View details"
                              className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingBooking(b)}
                              title="Update status"
                              className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ───────────────────────── */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onView={setViewingBooking}
                  onEdit={setEditingBooking}
                />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────── */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-500
                             hover:text-black hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, idx) =>
                      p === '…' ? (
                        <span key={`e-${idx}`} className="px-2 text-neutral-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                            p === meta.page
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                              : 'border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-500
                             hover:text-black hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── View Modal ─────────────────────────────── */}
      {viewingBooking && (
        <ViewModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onEdit={(b) => { setViewingBooking(null); setEditingBooking(b) }}
        />
      )}

      {/* ── Update Modal ───────────────────────────── */}
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