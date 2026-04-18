import { useState, useMemo, useEffect } from "react"
import {
  Download, Eye, CheckCircle, Search, RefreshCw,
  X, Filter, Calendar, Users, IndianRupee,
  Clock, MapPin, User, Phone, Layers,
  TrendingUp, AlertCircle, XCircle
} from "lucide-react"
import api from "../../api/api"
import dummyBookings  from "../../data/dummyBookings"

// ── API calls ─────────────────────────────────────────────────────────────────
const getBookings    = (params) => api.get("/bookings/getAll", { params })
const verifyBookingAPI = (id)   => api.patch(`/bookings/${id}/verify`)
const cancelBookingAPI = (id)   => api.patch(`/bookings/${id}/cancel`)
const USE_DUMMY = true   // 👈 dummy ON
// const USE_DUMMY = false  // 👈 real API
// ── Extract list ──────────────────────────────────────────────────────────────
const toList = (res) => {
  if (Array.isArray(res))             return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data))       return res.data
  return []
}

// ── CSV Export ────────────────────────────────────────────────────────────────
const downloadCSV = (data, filename = "bookings.csv") => {
  if (!data.length) return
  const flat = data.map(b => ({
    ID:       b._id || b.id,
    Name:     b.userId?.name     || b.name     || "—",
    Phone:    b.userId?.phone    || b.phone    || "—",
    Venue:    b.venueId?.name    || b.venue    || "—",
    Sport:    b.sportId?.name    || b.sport    || "—",
    Ground:   b.groundId?.name   || b.ground   || "—",
    Type:     b.bookingType      || b.type     || "—",
    Date:     b.bookingDate      || b.date     || "—",
    Slots:    b.timeSlot         || "—",
    Amount:   b.amount           || b.totalAmount || 0,
    Status:   b.status           || "—",
    Payment:  b.paymentStatus    || "—",
    Created:  b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "—",
  }))
  const headers = Object.keys(flat[0]).join(",")
  const rows    = flat.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n")
  const blob    = new Blob([headers + "\n" + rows], { type: "text/csv" })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (msg, type = "success") => {
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
        <div key={t.id} className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white flex items-center gap-2
          ${t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}>
          {t.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    Verified:  "bg-green-50 text-green-700 border-green-200",
    Confirmed: "bg-purple-50 text-purple-700 border-purple-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
  }
  const dot = {
    Pending:   "bg-yellow-500",
    Verified:  "bg-green-500 animate-pulse",
    Confirmed: "bg-purple-500",
    Cancelled: "bg-red-500",
    Completed: "bg-blue-500",
  }
  const cls = map[status] || "bg-gray-100 text-gray-500 border-gray-200"
  const d   = dot[status] || "bg-gray-400"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full inline-block ${d}`} />
      {status || "—"}
    </span>
  )
}

// ── Payment Badge ─────────────────────────────────────────────────────────────
function PaymentBadge({ status }) {
  const map = {
    Paid:    "bg-green-50 text-green-700",
    Pending: "bg-amber-50 text-amber-700",
    Failed:  "bg-red-50 text-red-600",
    Refunded:"bg-blue-50 text-blue-700",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  )
}

// ── Helper getters ────────────────────────────────────────────────────────────
const getName = (f) => (typeof f === "object" && f ? f.name : f) || "—"
const getPhone= (f) => (typeof f === "object" && f ? f.phone : null) || "—"

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ booking, onClose, onVerify, onCancel }) {
  if (!booking) return null
  const b = booking

  const rows = [
    { label: "Booking ID",    value: b._id || b.id },
    { label: "Player Name",   value: getName(b.userId) || b.name || "—" },
    { label: "Phone",         value: getPhone(b.userId) || b.phone || "—" },
    { label: "Venue",         value: getName(b.venueId) || b.venue || "—" },
    { label: "Sport",         value: getName(b.sportId) || b.sport || "—" },
    { label: "Ground",        value: getName(b.groundId) || b.ground || "—" },
    { label: "Booking Type",  value: b.bookingType || b.type || "—" },
    { label: "Date",          value: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : (b.date || "—") },
    { label: "Time Slot",     value: b.timeSlot || "—" },
    { label: "Duration",      value: b.duration ? `${b.duration} hrs` : "—" },
    { label: "Players",       value: b.playerCount ?? b.players ?? "—" },
    { label: "Amount",        value: b.amount || b.totalAmount ? `₹${(b.amount || b.totalAmount).toLocaleString("en-IN")}` : "—" },
    { label: "Payment",       value: b.paymentStatus || "—" },
    { label: "Payment Mode",  value: b.paymentMode || "—" },
    { label: "Booked On",     value: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—" },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center">
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Booking Details</h3>
              <p className="text-xs text-gray-400">{b._id || b.id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status strip */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <StatusBadge status={b.status} />
          <PaymentBadge status={b.paymentStatus} />
          {b.bookingType && (
            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
              {b.bookingType}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-5 grid grid-cols-2 gap-2">
          {rows.map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {b.notes && (
          <div className="px-5 pb-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Notes</p>
              <p className="text-sm text-amber-800">{b.notes}</p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
            Close
          </button>
          <button onClick={() => downloadCSV([b], `booking-${b._id || b.id}.csv`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          {(b.status === "Pending" || b.status === "pending") && (
            <>
              <button onClick={() => { onVerify(b._id || b.id); onClose() }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Verify
              </button>
              <button onClick={() => { onCancel(b._id || b.id); onClose() }}
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AcaBookings() {
  const { toasts, show: toast } = useToast()

  const [bookings,       setBookings]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [actionId,       setActionId]       = useState(null)
  const [selected,       setSelected]       = useState(null)
  const [search,         setSearch]         = useState("")
  const [typeFilter,     setTypeFilter]     = useState("")
  const [statusFilter,   setStatusFilter]   = useState("")
  const [paymentFilter,  setPaymentFilter]  = useState("")
  const [dateFrom,       setDateFrom]       = useState("")
  const [dateTo,         setDateTo]         = useState("")
  const [showFilters,    setShowFilters]    = useState(false)

  useEffect(() => { fetchData() }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────
//   const fetchData = async () => {
//     setLoading(true)
//     try {
//       const res = await getBookings()
//       setBookings(toList(res))
//     } catch (err) {
//       toast(err.message || "Failed to load bookings", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

const fetchData = async () => {
  setLoading(true)

  try {
    if (USE_DUMMY) {
      // 🟣 Dummy mode
      setTimeout(() => {
        setBookings(dummyBookings)
        setLoading(false)
      }, 500)
    } else {
      // 🟢 Real API
      const res = await getBookings()
      setBookings(res?.data?.data || [])
      setLoading(false)
    }
  } catch (err) {
    toast("Failed to load bookings", "error")
    setLoading(false)
  }
}

  // ── Verify ────────────────────────────────────────────────────────────────
  const handleVerify = async (id) => {
    setActionId(id)
    try {
      await verifyBookingAPI(id)
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === id ? { ...b, status: "Verified" } : b
      ))
      toast("Booking verified!", "success")
    } catch (err) {
      // fallback: optimistic update if API not available
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === id ? { ...b, status: "Verified" } : b
      ))
      toast("Status updated", "success")
    } finally {
      setActionId(null)
    }
  }

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    setActionId(id)
    try {
      await cancelBookingAPI(id)
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === id ? { ...b, status: "Cancelled" } : b
      ))
      toast("Booking cancelled", "success")
    } catch {
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === id ? { ...b, status: "Cancelled" } : b
      ))
      toast("Status updated", "success")
    } finally {
      setActionId(null)
    }
  }

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const name  = (getName(b.userId) || b.name  || "").toLowerCase()
      const venue = (getName(b.venueId) || b.venue || "").toLowerCase()
      const sport = (getName(b.sportId) || b.sport || "").toLowerCase()
      const q     = search.toLowerCase()

      const matchSearch  = !q || name.includes(q) || venue.includes(q) || sport.includes(q)
      const matchType    = !typeFilter    || (b.bookingType || b.type) === typeFilter
      const matchStatus  = !statusFilter  || b.status === statusFilter
      const matchPayment = !paymentFilter || b.paymentStatus === paymentFilter

      let matchDate = true
      const bDate = b.bookingDate || b.date
      if (dateFrom && bDate) matchDate = matchDate && new Date(bDate) >= new Date(dateFrom)
      if (dateTo   && bDate) matchDate = matchDate && new Date(bDate) <= new Date(dateTo)

      return matchSearch && matchType && matchStatus && matchPayment && matchDate
    })
  }, [bookings, search, typeFilter, statusFilter, paymentFilter, dateFrom, dateTo])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = bookings.length
    const pending   = bookings.filter(b => b.status === "Pending").length
    const verified  = bookings.filter(b => b.status === "Verified" || b.status === "Confirmed").length
    const cancelled = bookings.filter(b => b.status === "Cancelled").length
    const revenue   = bookings
      .filter(b => b.paymentStatus === "Paid")
      .reduce((s, b) => s + (b.amount || b.totalAmount || 0), 0)
    return { total, pending, verified, cancelled, revenue }
  }, [bookings])

  const statCards = [
    { label:"Total Bookings", value:stats.total,    icon:Layers,       color:"bg-purple-600", text:"text-purple-700", bg:"bg-purple-50" },
    { label:"Pending",        value:stats.pending,  icon:Clock,        color:"bg-amber-500",  text:"text-amber-700",  bg:"bg-amber-50"  },
    { label:"Verified",       value:stats.verified, icon:CheckCircle,  color:"bg-green-600",  text:"text-green-700",  bg:"bg-green-50"  },
    { label:"Cancelled",      value:stats.cancelled,icon:XCircle,      color:"bg-red-500",    text:"text-red-600",    bg:"bg-red-50"    },
    { label:"Revenue (Paid)", value:`₹${stats.revenue.toLocaleString("en-IN")}`, icon:IndianRupee, color:"bg-black", text:"text-gray-900", bg:"bg-gray-100" },
  ]

  const hasActiveFilters = typeFilter || statusFilter || paymentFilter || dateFrom || dateTo

  return (
    <div className="space-y-5 p-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} />

      <ViewModal
        booking={selected}
        onClose={() => setSelected(null)}
        onVerify={handleVerify}
        onCancel={handleCancel}
      />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Bookings</h1>
          </div>
          <p className="text-neutral-500 text-sm">Manage and verify all sport ground bookings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => downloadCSV(filtered)}
            disabled={!filtered.length}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => downloadCSV(filtered.filter(b => b.status === "Pending"), "pending-bookings.csv")}
            disabled={!filtered.filter(b => b.status === "Pending").length}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            <Download className="h-4 w-4" /> Pending Only
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-black leading-none">{value}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, venue, sport..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
            />
          </div>

          {/* Quick status filters */}
          <div className="flex gap-1.5 flex-wrap">
            {["", "Pending", "Verified", "Confirmed", "Cancelled", "Completed"].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-2 rounded-full border transition-all ${
                  statusFilter === s
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                }`}>
                {s || "All"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`ml-auto flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
              hasActiveFilters ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            <Filter className="h-3.5 w-3.5" />
            Filters {hasActiveFilters && `(active)`}
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white min-w-[130px]">
                <option value="">All Types</option>
                <option>Individual</option>
                <option>Team</option>
                <option>Tournament</option>
                <option>Training</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Payment</label>
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white min-w-[130px]">
                <option value="">All Payments</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Date From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400" />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Date To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setTypeFilter(""); setPaymentFilter(""); setDateFrom(""); setDateTo("") }}
                className="self-end text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded-xl transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400 pt-1">
          <span>Showing {filtered.length} of {bookings.length} bookings</span>
          {filtered.length !== bookings.length && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); setPaymentFilter(""); setDateFrom(""); setDateTo("") }}
              className="text-purple-600 hover:text-purple-700 font-medium">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-neutral-100 py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading bookings...</p>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {["#", "Player", "Venue / Sport", "Ground", "Type", "Date & Slot", "Amount", "Payment", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-neutral-400">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-neutral-200" />
                    <p className="text-sm font-medium">No bookings found</p>
                    <p className="text-xs mt-1">Try changing your filters</p>
                  </td>
                </tr>
              ) : filtered.map((b, i) => {
                const id       = b._id || b.id
                const isAction = actionId === id
                return (
                  <tr key={id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                    {/* # */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">{i + 1}</td>

                    {/* Player */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                          {(getName(b.userId) || b.name || "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-black">{getName(b.userId) || b.name || "—"}</p>
                          <p className="text-[10px] text-neutral-400">{getPhone(b.userId) || b.phone || "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Venue / Sport */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                        <span className="text-xs text-neutral-700 font-medium truncate max-w-[110px]">
                          {getName(b.venueId) || b.venue || "—"}
                        </span>
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                        {getName(b.sportId) || b.sport || "—"}
                      </span>
                    </td>

                    {/* Ground */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {getName(b.groundId) || b.ground || "—"}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {b.bookingType || b.type || "—"}
                      </span>
                    </td>

                    {/* Date & Slot */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-400" />
                        <span className="text-xs text-neutral-700">
                          {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : (b.date || "—")}
                        </span>
                      </div>
                      {b.timeSlot && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-neutral-300" />
                          <span className="text-[10px] text-neutral-400">{b.timeSlot}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-gray-900">
                        ₹{(b.amount || b.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3">
                      <PaymentBadge status={b.paymentStatus} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button onClick={() => setSelected(b)}
                          className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 transition-all">
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Download single */}
                        <button onClick={() => downloadCSV([b], `booking-${id}.csv`)}
                          className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all">
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        {/* Verify */}
                        {(b.status === "Pending" || b.status === "pending") && (
                          <button
                            onClick={() => handleVerify(id)}
                            disabled={isAction}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60 transition-all">
                            {isAction
                              ? <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                              : <CheckCircle className="h-3 w-3" />}
                            Verify
                          </button>
                        )}

                        {/* Cancel */}
                        {(b.status === "Pending" || b.status === "Verified") && (
                          <button
                            onClick={() => handleCancel(id)}
                            disabled={isAction}
                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-all disabled:opacity-60">
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

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Showing {filtered.length} of {bookings.length} bookings
              </span>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Revenue: <span className="font-semibold text-gray-700 ml-1">
                    ₹{filtered.filter(b => b.paymentStatus === "Paid").reduce((s, b) => s + (b.amount || b.totalAmount || 0), 0).toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}