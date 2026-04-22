import { useState, useEffect, useCallback } from 'react'
import {
  CalendarDays, Search, RefreshCw, Eye, X,
  ChevronLeft, ChevronRight, Clock, User,
  CreditCard, MapPin, Layers, CheckCircle,
  XCircle, AlertCircle, Hourglass, Filter,
  LayoutGrid, List, IndianRupee, ShieldCheck,
  Dumbbell
} from 'lucide-react'
import api from '../../api/api'

// ── API ───────────────────────────────────────────────────────────────────────
const getCourtBookings = (params) =>
  api.get('/courtBookings/getAll', { params })

// ── Helpers ───────────────────────────────────────────────────────────────────
const toList = (res) => {
  const d = res?.data?.data ?? res?.data ?? res
  if (Array.isArray(d?.data)) return { list: d.data, meta: { total: d.total, totalPages: d.totalPages, page: d.page, limit: d.limit } }
  if (Array.isArray(d))       return { list: d, meta: {} }
  return { list: [], meta: {} }
}

const fmt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}
const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const fmtTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { color: 'bg-amber-100 text-amber-700',   icon: Hourglass,    dot: 'bg-amber-400'  },
  confirmed: { color: 'bg-green-100 text-green-700',   icon: CheckCircle,  dot: 'bg-green-400'  },
  cancelled: { color: 'bg-red-100 text-red-600',       icon: XCircle,      dot: 'bg-red-400'    },
  completed: { color: 'bg-blue-100 text-blue-700',     icon: ShieldCheck,  dot: 'bg-blue-400'   },
}
const PAY_CFG = {
  pending: { color: 'bg-orange-100 text-orange-700' },
  paid:    { color: 'bg-emerald-100 text-emerald-700' },
  failed:  { color: 'bg-red-100 text-red-600' },
  refunded:{ color: 'bg-purple-100 text-purple-700' },
}

const StatusBadge = ({ status, type = 'booking' }) => {
  const cfg = type === 'payment' ? PAY_CFG[status] : STATUS_CFG[status]
  const color = cfg?.color || 'bg-gray-100 text-gray-600'
  const Icon  = STATUS_CFG[status]?.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${color}`}>
      {Icon && type !== 'payment' && <Icon className="h-2.5 w-2.5" />}
      {status || '—'}
    </span>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-400/20 transition-all bg-white'

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

// ── Detail Modal ──────────────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null

  const user  = booking.userId  || {}
  const items = booking.items   || []

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Booking Details</h3>
              <p className="text-[10px] text-gray-400 font-mono">{booking._id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Status row */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.paymentStatus} type="payment" />
            <span className="text-[10px] text-neutral-400 ml-auto self-center">{fmt(booking.createdAt)}</span>
          </div>

          {/* User */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Customer</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Name',   value: user.name   || '—' },
                { label: 'Email',  value: user.email  || '—' },
                { label: 'Mobile', value: user.mobile || '—' },
                { label: 'Role',   value: user.role   || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                  <p className="text-xs font-medium text-gray-800 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          {items.map((item, idx) => {
            const ground = item.groundId || {}
            const court  = item.courtId  || {}
            const sport  = item.sportId  || {}
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-700">Item #{idx + 1}</p>
                  <span className="text-xs font-bold text-purple-700 flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />{item.price}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Ground</p>
                    <p className="text-xs font-medium text-gray-800">{ground.name || '—'}</p>
                    {ground.type && <p className="text-[10px] text-gray-400 capitalize">{ground.type}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Court</p>
                    <p className="text-xs font-medium text-gray-800 capitalize">{court.name || '—'}</p>
                    {court.pricePerHour && <p className="text-[10px] text-gray-400">₹{court.pricePerHour}/hr</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Sport</p>
                    <div className="flex items-center gap-1.5">
                      {sport.image && <img src={sport.image} alt="" className="w-4 h-4 rounded object-cover" onError={e=>e.target.style.display='none'} />}
                      <p className="text-xs font-medium text-gray-800 capitalize">{sport.name || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Timing</p>
                    <p className="text-xs font-medium text-gray-800">{ground.openingTime} – {ground.closingTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Start</p>
                    <p className="text-xs font-medium text-gray-800">{fmtDate(item.startTime)}</p>
                    <p className="text-[10px] text-gray-400">{fmtTime(item.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">End</p>
                    <p className="text-xs font-medium text-gray-800">{fmtDate(item.endTime)}</p>
                    <p className="text-[10px] text-gray-400">{fmtTime(item.endTime)}</p>
                  </div>
                  {item.slotStarts?.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400 mb-1">Slots</p>
                      <div className="flex flex-wrap gap-1">
                        {item.slotStarts.map((s, i) => (
                          <span key={i} className="text-[10px] bg-purple-50 border border-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            {fmtTime(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Total */}
          <div className="bg-black rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-neutral-400">Total Amount</p>
              <p className="text-xl font-bold text-white flex items-center gap-0.5">
                <IndianRupee className="h-4 w-4" />{booking.totalPrice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-400">Payment Status</p>
              <StatusBadge status={booking.paymentStatus} type="payment" />
            </div>
          </div>

          {booking.cancelledAt && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
              Cancelled at: {fmt(booking.cancelledAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function CourtBookings({ academyId }) {
  const { toasts, show: toast } = useToast()

  const [bookings,     setBookings]     = useState([])
  const [meta,         setMeta]         = useState({})
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [payFilter,    setPayFilter]    = useState('')
  const [page,         setPage]         = useState(1)
  const [limit]                         = useState(10)
  const [viewMode,     setViewMode]     = useState('table')
  const [viewBooking,  setViewBooking]  = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (academyId)    params.academyId     = academyId
      if (statusFilter) params.status        = statusFilter
      if (payFilter)    params.paymentStatus = payFilter
      const res = await getCourtBookings(params)
      const { list, meta: m } = toList(res)
      setBookings(list)
      setMeta(m)
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Failed to load bookings', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, academyId, statusFilter, payFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Client-side search filter on already-fetched page
  const filtered = bookings.filter(b => {
    const q = search.toLowerCase()
    if (!q) return true
    const user = b.userId || {}
    return (
      b._id?.toLowerCase().includes(q) ||
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.mobile?.toLowerCase().includes(q) ||
      b.items?.some(i =>
        i.groundId?.name?.toLowerCase().includes(q) ||
        i.courtId?.name?.toLowerCase().includes(q) ||
        i.sportId?.name?.toLowerCase().includes(q)
      )
    )
  })

  // ── Stat counts ──
  const total     = meta.total     ?? bookings.length
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const revenue   = bookings.reduce((s, b) => s + (b.paymentStatus === 'paid' ? (b.totalPrice || 0) : 0), 0)

  const stats = [
    { label: 'Total Bookings', value: total,     sub: 'all time',      icon: CalendarDays, color: 'bg-purple-600' },
    { label: 'Pending',        value: pending,   sub: 'awaiting',      icon: Hourglass,    color: 'bg-amber-500'  },
    { label: 'Confirmed',      value: confirmed, sub: 'approved',      icon: CheckCircle,  color: 'bg-green-600'  },
    { label: 'Revenue (₹)',    value: `₹${revenue}`, sub: 'paid only', icon: IndianRupee,  color: 'bg-black'      },
  ]

  const totalPages = meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <BookingDetailModal booking={viewBooking} onClose={() => setViewBooking(null)} />

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Court Bookings</h1>
          </div>
          <p className="text-neutral-500 text-sm">All court reservations with user, ground & slot details</p>
        </div>
        <button onClick={fetchBookings}
          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input type="text" placeholder="Search user, ground, court, sport..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
        </div>

        {/* Booking Status */}
        <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Filter className="h-3 w-3 text-neutral-400" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-xs text-black outline-none bg-transparent">
            <option value="">All Status</option>
            {['pending','confirmed','cancelled','completed'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <CreditCard className="h-3 w-3 text-neutral-400" />
          <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1) }}
            className="text-xs text-black outline-none bg-transparent">
            <option value="">All Payments</option>
            {['pending','paid','failed','refunded'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>

        {/* View toggle */}
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

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading bookings...</p>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['#', 'Booking ID', 'Customer', 'Ground / Court', 'Sport', 'Date & Slot', 'Amount', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-14 text-neutral-400 text-sm">
                      <CalendarDays className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
                      No bookings found
                    </td>
                  </tr>
                ) : filtered.map((b, i) => {
                  const user  = b.userId  || {}
                  const item  = b.items?.[0] || {}
                  const ground = item.groundId || {}
                  const court  = item.courtId  || {}
                  const sport  = item.sportId  || {}
                  const moreItems = b.items?.length > 1

                  return (
                    <tr key={b._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      {/* # */}
                      <td className="px-4 py-3 text-neutral-400 text-xs">{(page - 1) * limit + i + 1}</td>

                      {/* Booking ID */}
                      <td className="px-4 py-3">
                        <p className="text-[10px] font-mono text-neutral-500 truncate max-w-[90px]" title={b._id}>{b._id?.slice(-8)}</p>
                        <p className="text-[9px] text-neutral-300">{fmtDate(b.createdAt)}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-purple-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-black truncate max-w-[100px]">{user.name || '—'}</p>
                            <p className="text-[10px] text-neutral-400 truncate max-w-[100px]">{user.mobile || user.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Ground / Court */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 mb-0.5">
                          <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                          <p className="text-xs font-medium text-black truncate max-w-[100px] capitalize">{ground.name || '—'}</p>
                        </div>
                        <p className="text-[10px] text-neutral-400 pl-4 capitalize">{court.name || '—'} {court.pricePerHour ? `· ₹${court.pricePerHour}/hr` : ''}</p>
                        {moreItems && <p className="text-[9px] text-purple-400 pl-4">+{b.items.length - 1} more</p>}
                      </td>

                      {/* Sport */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {sport.image
                            ? <img src={sport.image} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-100" onError={e => e.target.style.display = 'none'} />
                            : <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center"><Dumbbell className="h-2.5 w-2.5 text-purple-400" /></div>
                          }
                          <span className="text-xs text-neutral-600 capitalize">{sport.name || '—'}</span>
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 mb-0.5">
                          <CalendarDays className="h-3 w-3 text-neutral-400" />
                          <p className="text-xs text-neutral-700">{fmtDate(item.startTime)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          <p className="text-[10px] text-neutral-500">{fmtTime(item.startTime)} – {fmtTime(item.endTime)}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-black flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />{b.totalPrice}
                        </p>
                        {b.items?.length > 1 && (
                          <p className="text-[10px] text-neutral-400">{b.items.length} items</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <StatusBadge status={b.paymentStatus} type="payment" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button onClick={() => setViewBooking(b)}
                          className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Page {page} of {totalPages} · {meta.total ?? filtered.length} total
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const pg = page <= 3 ? idx + 1 : page + idx - 2
                  if (pg < 1 || pg > totalPages) return null
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                        ${pg === page ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {pg}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {totalPages <= 1 && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
              Showing {filtered.length} of {meta.total ?? filtered.length} bookings
            </div>
          )}
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-neutral-200 py-14 text-center">
              <CalendarDays className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
              <p className="text-neutral-400 text-sm">No bookings found</p>
            </div>
          ) : filtered.map(b => {
            const user  = b.userId  || {}
            const item  = b.items?.[0] || {}
            const ground = item.groundId || {}
            const court  = item.courtId  || {}
            const sport  = item.sportId  || {}

            return (
              <div key={b._id} className="bg-white rounded-2xl border border-neutral-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-purple-50 to-white px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400">{b._id?.slice(-10)}</p>
                    <p className="text-[10px] text-neutral-300">{fmtDate(b.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.paymentStatus} type="payment" />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* User */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">{user.name || '—'}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email || user.mobile || '—'}</p>
                    </div>
                  </div>

                  {/* Ground + Court */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3 w-3 text-purple-400" />
                      <p className="text-xs font-semibold text-black capitalize truncate">{ground.name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-neutral-400" />
                      <p className="text-[10px] text-neutral-500 capitalize">{court.name || '—'}</p>
                      {court.pricePerHour && <span className="text-[10px] text-neutral-400">· ₹{court.pricePerHour}/hr</span>}
                    </div>
                  </div>

                  {/* Sport + Slot */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      {sport.image
                        ? <img src={sport.image} alt="" className="w-4 h-4 rounded-full object-cover" onError={e => e.target.style.display = 'none'} />
                        : <Dumbbell className="h-3 w-3 text-neutral-400" />
                      }
                      <span className="capitalize">{sport.name || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{fmtTime(item.startTime)} – {fmtTime(item.endTime)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <CalendarDays className="h-3 w-3" />
                    <span>{fmtDate(item.startTime)}</span>
                    {b.items?.length > 1 && <span className="ml-auto text-purple-400">+{b.items.length - 1} more items</span>}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <p className="text-sm font-bold text-black flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />{b.totalPrice}
                    </p>
                    <button onClick={() => setViewBooking(b)}
                      className="flex items-center gap-1 text-xs text-blue-500 border border-blue-200 bg-blue-50 rounded-lg px-3 py-1.5 hover:bg-blue-100">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Grid pagination */}
      {!loading && viewMode === 'grid' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}