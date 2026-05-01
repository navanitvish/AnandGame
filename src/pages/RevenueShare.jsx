import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  DollarSign, TrendingUp, Building2, Shield,
  Search, X, Eye, Calendar,
  CheckCircle, Clock, XCircle, PieChart,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { getAllRevenue } from '../api/api'   // ← real API call

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_PCT   = 30
const ACADEMY_PCT = 70
const PAGE_LIMIT  = 10

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcSplit = (amount) => {
  const total = Number(amount) || 0
  return {
    total,
    admin:   Math.round(total * ADMIN_PCT   / 100),
    academy: Math.round(total * ACADEMY_PCT / 100),
  }
}

const fmtCurrency = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  : '—'

const isPaid = (status) =>
  ['confirmed', 'completed', 'paid'].includes((status || '').toLowerCase())

// Safely pull a display name from the nested API shape
const bookingId  = (b) => b.bookingId   || b._id?.slice(-8).toUpperCase() || '—'
const userName   = (b) => b.userId?.name  || b.userId?.mobile || '—'
const academyName= (b) => b.academyId?.name  || '—'
const groundName = (b) => b.sportGroundId?.name || '—'
const sportName  = (b) => b.sportGroundId?.sportId?.name || '—'
const venueStr   = (b) => b.sportGroundId?.venueId?.name || '—'
const totalAmt   = (b) => Number(b.platformAmount || 0) + Number(b.academyAmount || 0) || 0

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  if (['confirmed', 'completed', 'paid'].includes(s))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium capitalize">
        <CheckCircle className="h-2.5 w-2.5" /> {status}
      </span>
    )
  if (s === 'pending')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium capitalize">
        <Clock className="h-2.5 w-2.5" /> {status}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium capitalize">
      <XCircle className="h-2.5 w-2.5" /> {status}
    </span>
  )
}

// ── Payment Status Badge ───────────────────────────────────────────────────────
function PayBadge({ status }) {
  const s = (status || '').toLowerCase()
  if (s === 'paid')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium capitalize">
        <CheckCircle className="h-2.5 w-2.5" /> paid
      </span>
    )
  if (s === 'pending')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium capitalize">
        <Clock className="h-2.5 w-2.5" /> pending
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium capitalize">
      <XCircle className="h-2.5 w-2.5" /> {status || 'unknown'}
    </span>
  )
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ booking: b, onClose }) {
  if (!b) return null
  const total   = totalAmt(b)
  const admin   = Number(b.platformAmount || 0) || Math.round(total * ADMIN_PCT / 100)
  const academy = Number(b.academyAmount  || 0) || Math.round(total * ACADEMY_PCT / 100)

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{bookingId(b)}</h3>
              <p className="text-xs text-gray-400">Revenue Breakdown</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Academy image */}
          {b.academyId?.image && (
            <img src={b.academyId.image} alt={academyName(b)}
              className="w-full h-28 object-cover rounded-xl border border-gray-100" />
          )}

          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'User',           value: userName(b)           },
              { label: 'Academy',        value: academyName(b)        },
              { label: 'Ground',         value: groundName(b)         },
              { label: 'Sport',          value: sportName(b)          },
              { label: 'Venue',          value: venueStr(b)           },
              { label: 'Date',           value: fmtDate(b.startTime)  },
              { label: 'Start',          value: fmtTime(b.startTime)  },
              { label: 'End',            value: fmtTime(b.endTime)    },
              { label: 'Status',         value: <StatusBadge status={b.status} />         },
              { label: 'Payment',        value: <PayBadge   status={b.paymentStatus} />   },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Split Breakdown */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Revenue Split</p>

            <div className="w-full h-3 rounded-full overflow-hidden flex mb-2">
              <div className="bg-black h-full" style={{ width: `${ADMIN_PCT}%` }} />
              <div className="bg-purple-500 h-full" style={{ width: `${ACADEMY_PCT}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-4">
              <span>Admin {ADMIN_PCT}%</span>
              <span>Academy {ACADEMY_PCT}%</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 mb-3">
              <span className="text-sm text-gray-500 font-medium">Total Booking Amount</span>
              <span className="text-base font-bold text-gray-900">{fmtCurrency(total)}</span>
            </div>

            <div className="flex items-center justify-between py-2.5 bg-black/5 rounded-xl px-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Platform (Admin)</p>
                  <p className="text-[10px] text-gray-400">{ADMIN_PCT}% share</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{fmtCurrency(admin)}</span>
            </div>

            <div className="flex items-center justify-between py-2.5 bg-purple-50 rounded-xl px-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{academyName(b)}</p>
                  <p className="text-[10px] text-gray-400">{ACADEMY_PCT}% share</p>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-700">{fmtCurrency(academy)}</span>
            </div>
          </div>

          {/* Razorpay order */}
          {b.razorpayOrderId && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Razorpay Order ID</p>
              <p className="text-xs font-mono text-blue-700 break-all">{b.razorpayOrderId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-full max-w-[80px]" />
        </td>
      ))}
    </tr>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function RevenueShare() {
  const [bookings,     setBookings]     = useState([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [page,         setPage]         = useState(1)
  const [search,       setSearch]       = useState('')
  const [debouncedQ,   setDebouncedQ]   = useState('')
  const [filter,       setFilter]       = useState('all')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [viewBooking,  setViewBooking]  = useState(null)

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllRevenue(page, PAGE_LIMIT, debouncedQ)
      // shape: { success, data: { total, totalPages, page, limit, data: Booking[] } }
      const d = res?.data || res
      setBookings(d?.data  || [])
      setTotal(d?.total    || 0)
      setTotalPages(d?.totalPages || 1)
    } catch (e) {
      setError(e?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQ])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Client-side status filter (on the current page) ────────────────────────
  const filtered = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter(b => b.status?.toLowerCase() === filter)
  }, [bookings, filter])

  // ── Stats derived from current page ───────────────────────────────────────
  const paidBookings   = bookings.filter(b => isPaid(b.status))
  const totalRevenue   = paidBookings.reduce((s, b) => s + totalAmt(b), 0)
  const totalAdmin     = Math.round(totalRevenue * ADMIN_PCT   / 100)
  const totalAcademy   = Math.round(totalRevenue * ACADEMY_PCT / 100)

  const filteredPaid   = filtered.reduce((s, b) => s + (isPaid(b.status) ? totalAmt(b) : 0), 0)
  const filteredAdmin  = Math.round(filteredPaid * ADMIN_PCT   / 100)
  const filteredAcad   = Math.round(filteredPaid * ACADEMY_PCT / 100)

  const stats = [
    { label: 'Total Revenue',  value: fmtCurrency(totalRevenue), sub: `${paidBookings.length} paid on this page`, icon: TrendingUp, color: 'bg-black'      },
    { label: 'Platform Share', value: fmtCurrency(totalAdmin),   sub: `${ADMIN_PCT}% of revenue`,                 icon: Shield,     color: 'bg-gray-700'   },
    { label: 'Academy Share',  value: fmtCurrency(totalAcademy), sub: `${ACADEMY_PCT}% of revenue`,               icon: Building2,  color: 'bg-purple-600' },
    { label: 'Total Bookings', value: total,                      sub: `page ${page} of ${totalPages}`,            icon: Calendar,   color: 'bg-blue-600'   },
  ]

  const STATUS_FILTERS = ['all', 'confirmed', 'completed', 'pending', 'cancelled']

  return (
    <div className="space-y-6">

      {viewBooking && (
        <ViewModal booking={viewBooking} onClose={() => setViewBooking(null)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <PieChart className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Revenue Share</h1>
          </div>
          <p className="text-neutral-500 text-sm">
            Every booking —&nbsp;
            <span className="font-semibold text-black">{ADMIN_PCT}%</span> to Platform&nbsp;·&nbsp;
            <span className="font-semibold text-purple-600">{ACADEMY_PCT}%</span> to Academy
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button onClick={fetchData} disabled={loading}
            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Split pill */}
          <div className="hidden sm:flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-black" />
              <span className="text-xs font-bold text-black">{ADMIN_PCT}%</span>
              <span className="text-xs text-neutral-400">Platform</span>
            </div>
            <div className="w-px h-4 bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-purple-500" />
              <span className="text-xs font-bold text-purple-700">{ACADEMY_PCT}%</span>
              <span className="text-xs text-neutral-400">Academy</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchData}
            className="ml-auto text-xs text-red-500 underline hover:text-red-700">Retry</button>
        </div>
      )}

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

      {/* ── Visual Split Bar ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-black">Revenue Distribution</p>
          <span className="text-xs text-neutral-400">Collected (this page): {fmtCurrency(totalRevenue)}</span>
        </div>
        <div className="w-full h-5 rounded-full overflow-hidden flex">
          <div className="bg-black h-full flex items-center justify-center" style={{ width: `${ADMIN_PCT}%` }}>
            <span className="text-[9px] text-white font-bold">{ADMIN_PCT}%</span>
          </div>
          <div className="bg-purple-500 h-full flex items-center justify-center" style={{ width: `${ACADEMY_PCT}%` }}>
            <span className="text-[9px] text-white font-bold">{ACADEMY_PCT}%</span>
          </div>
        </div>
        <div className="flex justify-between mt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-black" />
            <span className="text-xs text-neutral-500">
              Platform (Admin) — <span className="font-bold text-black">{fmtCurrency(totalAdmin)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span className="text-xs text-neutral-500">
              Academy — <span className="font-bold text-purple-700">{fmtCurrency(totalAcademy)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input type="text" placeholder="Search booking, user, academy..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
          {search && (
            <button onClick={() => setSearch('')} className="text-neutral-300 hover:text-neutral-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-full border font-medium capitalize transition-all
                ${filter === f
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-purple-300 hover:text-purple-600'
                }`}>
              {f === 'all' ? `All (${total})` : f}
            </button>
          ))}
        </div>

        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-purple-500 ml-auto" />
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {[
                  '#', 'Booking ID', 'User', 'Ground / Sport', 'Academy',
                  'Date', 'Total Amount', `Platform (${ADMIN_PCT}%)`,
                  `Academy (${ACADEMY_PCT}%)`,  'Action'
                ].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-14 text-neutral-400 text-sm">
                    <DollarSign className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
                    No bookings found
                  </td>
                </tr>
              ) : filtered.map((b, i) => {
                const tot  = totalAmt(b)
                const adm  = Number(b.platformAmount || 0) || Math.round(tot * ADMIN_PCT  / 100)
                const acad = Number(b.academyAmount  || 0) || Math.round(tot * ACADEMY_PCT / 100)
                const paid = isPaid(b.status)

                return (
                  <tr key={b._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                    {/* # */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {(page - 1) * PAGE_LIMIT + i + 1}
                    </td>

                    {/* Booking ID */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-black">{bookingId(b)}</span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-purple-600">
                            {(userName(b)).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-700 whitespace-nowrap">{userName(b)}</span>
                      </div>
                    </td>

                    {/* Ground / Sport */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-neutral-700 whitespace-nowrap">{groundName(b)}</p>
                      <p className="text-[10px] text-neutral-400">{sportName(b)}</p>
                    </td>

                    {/* Academy */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {academyName(b)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-neutral-500 whitespace-nowrap">{fmtDate(b.startTime || b.createdAt)}</p>
                      <p className="text-[10px] text-neutral-300">{fmtTime(b.startTime)}</p>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-black">{fmtCurrency(tot)}</span>
                    </td>

                    {/* Admin share */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span className={`text-xs font-semibold ${paid ? 'text-black' : 'text-neutral-300'}`}>
                          {fmtCurrency(adm)}
                        </span>
                        {!paid && <span className="text-[9px] text-neutral-300">(unpaid)</span>}
                      </div>
                    </td>

                    {/* Academy share */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className={`text-xs font-semibold ${paid ? 'text-purple-700' : 'text-neutral-300'}`}>
                          {fmtCurrency(acad)}
                        </span>
                        {!paid && <span className="text-[9px] text-neutral-300">(unpaid)</span>}
                      </div>
                    </td>

                    {/* Booking Status */}
                    {/* <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td> */}

                    {/* Payment Status */}
                    {/* <td className="px-4 py-3">
                      <PayBadge status={b.paymentStatus} />
                    </td> */}

                    {/* Action */}
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

        {/* ── Footer: totals + pagination ── */}
        <div className="px-5 py-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          {/* Totals */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-neutral-500">
              Collected: <span className="font-bold text-black">{fmtCurrency(filteredPaid)}</span>
            </span>
            <span className="text-neutral-200">|</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-black" />
              <span className="text-neutral-500">
                Platform: <span className="font-bold text-black">{fmtCurrency(filteredAdmin)}</span>
              </span>
            </div>
            <span className="text-neutral-200">|</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-purple-500" />
              <span className="text-neutral-500">
                Academy: <span className="font-bold text-purple-700">{fmtCurrency(filteredAcad)}</span>
              </span>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              Page {page} of {totalPages} · {total} total
            </span>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}