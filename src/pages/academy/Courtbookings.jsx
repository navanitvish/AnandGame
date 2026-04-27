import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CalendarDays, Search, RefreshCw, Eye, X,
  ChevronLeft, ChevronRight, Clock, User,
  CreditCard, MapPin, Layers, CheckCircle,
  XCircle, AlertCircle, Hourglass, Filter,
  LayoutGrid, List, IndianRupee, ShieldCheck,
  Dumbbell, Ban, ChevronDown, Download, FileText,
  FileJson
} from 'lucide-react'
import api from '../../api/api'

// ── API ───────────────────────────────────────────────────────────────────────
const getCourtBookings   = (params) => api.get('/courtBookings/getAll', { params })
const updateCourtBooking = (id, data) => api.put(`/courtBookings/update/${id}`, data)
const cancelCourtBooking = (id)       => api.put(`/courtBookings/cancel/${id}`)

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

// ── Export Helpers ─────────────────────────────────────────────────────────────
const flattenBookingForExport = (b) => {
  const user   = b.userId     || {}
  const items  = b.items      || []
  const item   = items[0]     || {}
  const ground = item.groundId || {}
  const court  = item.courtId  || {}
  const sport  = item.sportId  || {}

  return {
    'Booking ID':       b._id || '',
    'Short ID':         b._id ? `#${b._id.slice(-6)}` : '',
    'Created At':       fmt(b.createdAt),
    'Booking Status':   b.status || '',
    'Payment Status':   b.paymentStatus || '',
    'Total Price (₹)':  b.totalPrice ?? '',
    'Cancelled At':     b.cancelledAt ? fmt(b.cancelledAt) : '',

    // User
    'User Name':        user.name   || '',
    'User Email':       user.email  || '',
    'User Mobile':      user.mobile || '',
    'User Role':        user.role   || '',

    // Primary item
    'Ground Name':      ground.name        || '',
    'Ground Type':      ground.type        || '',
    'Opening Time':     ground.openingTime || '',
    'Closing Time':     ground.closingTime || '',
    'Court Name':       court.name         || '',
    'Court Price/hr':   court.pricePerHour ?? '',
    'Sport Name':       sport.name         || '',

    'Item Start Date':  fmtDate(item.startTime),
    'Item Start Time':  fmtTime(item.startTime),
    'Item End Date':    fmtDate(item.endTime),
    'Item End Time':    fmtTime(item.endTime),
    'Item Price (₹)':   item.price ?? '',
    'Total Items':      items.length,

    // Slots for first item (comma-separated)
    'Slots':            (item.slotStarts || []).map(s => fmtTime(s)).join(', '),
  }
}

const exportToCSV = (allBookings, filename = 'court_bookings') => {
  if (!allBookings.length) return
  const rows = allBookings.map(flattenBookingForExport)
  const headers = Object.keys(rows[0])
  const escape  = (val) => {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csv = [
    headers.map(escape).join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const exportToJSON = (allBookings, filename = 'court_bookings') => {
  if (!allBookings.length) return
  const blob = new Blob([JSON.stringify(allBookings, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Export Button with Dropdown ───────────────────────────────────────────────
function ExportButton({ academyId, statusFilter, payFilter, toast }) {
  const [open,         setOpen]         = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [exportFormat, setExportFormat] = useState(null) // 'csv' | 'json'
  const [progress,     setProgress]     = useState({ fetched: 0, total: 0 })
  const dropRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchAllPages = async () => {
    const PAGE_SIZE = 100
    let allData     = []
    let currentPage = 1
    let totalPages  = 1

    // First call — discover total pages
    const params = { page: 1, limit: PAGE_SIZE }
    if (academyId)    params.academyId     = academyId
    if (statusFilter) params.status        = statusFilter
    if (payFilter)    params.paymentStatus = payFilter

    const firstRes = await getCourtBookings(params)
    const { list: firstList, meta } = toList(firstRes)
    allData    = [...firstList]
    totalPages = meta.totalPages ?? 1
    setProgress({ fetched: allData.length, total: meta.total ?? allData.length })

    // Fetch remaining pages
    for (currentPage = 2; currentPage <= totalPages; currentPage++) {
      const res = await getCourtBookings({ ...params, page: currentPage })
      const { list } = toList(res)
      allData = [...allData, ...list]
      setProgress(p => ({ ...p, fetched: allData.length }))
    }

    return allData
  }

  const handleExport = async (format) => {
    setOpen(false)
    setExporting(true)
    setExportFormat(format)
    setProgress({ fetched: 0, total: 0 })
    try {
      const all = await fetchAllPages()
      if (format === 'csv') exportToCSV(all)
      else                  exportToJSON(all)
      toast(`Exported ${all.length} bookings as ${format.toUpperCase()}`, 'success')
    } catch (err) {
      toast(err?.response?.data?.message || 'Export failed', 'error')
    } finally {
      setExporting(false)
      setExportFormat(null)
      setProgress({ fetched: 0, total: 0 })
    }
  }

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => !exporting && setOpen(o => !o)}
        disabled={exporting}
        className={`flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl border transition-all
          ${exporting
            ? 'bg-purple-50 border-purple-200 text-purple-400 cursor-wait'
            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 cursor-pointer shadow-sm'
          }`}
      >
        {exporting ? (
          <>
            <span className="h-3.5 w-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">
              {progress.total > 0
                ? `Exporting ${progress.fetched}/${progress.total}…`
                : 'Preparing…'}
            </span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && !exporting && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 bg-white border border-gray-200 rounded-2xl shadow-2xl w-64 py-3 overflow-hidden">
            <div className="px-4 pb-2.5 border-b border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Export All Data</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Downloads every booking matching current filters</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors mt-0.5">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Export as CSV</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Spreadsheet-ready · Excel / Google Sheets</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors mt-0.5">
                  <FileJson className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Export as JSON</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Raw full data · All nested fields included</p>
                </div>
              </button>
            </div>

            {(statusFilter || payFilter) && (
              <div className="mx-3 mb-1 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[10px] text-amber-600 font-medium">
                  ⚡ Active filters applied — only filtered bookings will be exported
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { color: 'bg-amber-100 text-amber-700',   icon: Hourglass,    dot: 'bg-amber-400'  },
  confirmed: { color: 'bg-green-100 text-green-700',   icon: CheckCircle,  dot: 'bg-green-400'  },
  cancelled: { color: 'bg-red-100 text-red-600',       icon: XCircle,      dot: 'bg-red-400'    },
  completed: { color: 'bg-blue-100 text-blue-700',     icon: ShieldCheck,  dot: 'bg-blue-400'   },
}
const PAY_CFG = {
  pending:  { color: 'bg-orange-100 text-orange-700' },
  paid:     { color: 'bg-emerald-100 text-emerald-700' },
  failed:   { color: 'bg-red-100 text-red-600' },
  refunded: { color: 'bg-purple-100 text-purple-700' },
}

const StatusBadge = ({ status, type = 'booking' }) => {
  const cfg   = type === 'payment' ? PAY_CFG[status] : STATUS_CFG[status]
  const color = cfg?.color || 'bg-gray-100 text-gray-600'
  const Icon  = STATUS_CFG[status]?.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${color}`}>
      {Icon && type !== 'payment' && <Icon className="h-2.5 w-2.5" />}
      {status || '—'}
    </span>
  )
}

// ── Inline Status Dropdown ────────────────────────────────────────────────────
function StatusDropdown({ bookingId, currentStatus, currentPayStatus, disabled, onUpdated, toast }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const isCancelled = currentStatus === 'cancelled'

  const handleUpdate = async (field, value) => {
    if (isCancelled) return
    setOpen(false)
    setLoading(true)
    try {
      const body = { [field]: value }
      await updateCourtBooking(bookingId, body)
      toast(`Updated ${field === 'status' ? 'booking status' : 'payment status'} to "${value}"`, 'success')
      onUpdated()
    } catch (err) {
      toast(err?.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        disabled={disabled || loading || isCancelled}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all
          ${isCancelled
            ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-70'
            : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 cursor-pointer'
          } ${loading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {loading
          ? <span className="h-2.5 w-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          : <ChevronDown className="h-2.5 w-2.5" />
        }
        Actions
      </button>

      {open && !isCancelled && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-40 bg-white border border-gray-200 rounded-xl shadow-xl w-52 py-2 overflow-hidden">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-1 pb-1.5">Booking Status</p>
            {['pending', 'confirmed', 'completed'].map(s => (
              <button key={s} onClick={() => handleUpdate('status', s)}
                className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-purple-50 transition-colors
                  ${currentStatus === s ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[s]?.dot || 'bg-gray-300'}`} />
                <span className="capitalize">{s}</span>
                {currentStatus === s && <span className="ml-auto text-[9px] text-purple-400">current</span>}
              </button>
            ))}
            <div className="border-t border-gray-100 my-1.5" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 pb-1.5">Payment Status</p>
            {['pending', 'paid', 'failed', 'refunded'].map(s => (
              <button key={s} onClick={() => handleUpdate('paymentStatus', s)}
                className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-purple-50 transition-colors
                  ${currentPayStatus === s ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  s === 'paid' ? 'bg-emerald-400' : s === 'failed' ? 'bg-red-400' : s === 'refunded' ? 'bg-purple-400' : 'bg-orange-400'
                }`} />
                <span className="capitalize">{s}</span>
                {currentPayStatus === s && <span className="ml-auto text-[9px] text-purple-400">current</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelModal({ booking, loading, onConfirm, onCancel }) {
  if (!booking) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-80">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ban className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Cancel Booking?</h3>
          <p className="text-sm text-gray-500">
            Cancel booking <span className="font-semibold font-mono">#{booking._id?.slice(-6)}</span> for{' '}
            <span className="font-semibold">{booking.userId?.name || 'this user'}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Keep
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-1.5">
            {loading
              ? <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Ban className="h-3.5 w-3.5" />
            }
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, onCancelClick, onUpdateStatus, toast }) {
  if (!booking) return null

  const user  = booking.userId || {}
  const items = booking.items  || []
  const isCancelled = booking.status === 'cancelled'

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
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
          <div className="flex items-center gap-2">
            {!isCancelled && (
              <button onClick={() => onCancelClick(booking)}
                className="flex items-center gap-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100">
                <Ban className="h-3.5 w-3.5" /> Cancel
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.paymentStatus} type="payment" />
            {!isCancelled && (
              <div className="ml-2">
                <StatusDropdown
                  bookingId={booking._id}
                  currentStatus={booking.status}
                  currentPayStatus={booking.paymentStatus}
                  onUpdated={onUpdateStatus}
                  toast={toast}
                />
              </div>
            )}
            <span className="text-[10px] text-neutral-400 ml-auto self-center">{fmt(booking.createdAt)}</span>
          </div>

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
                      {sport.image && <img src={sport.image} alt="" className="w-4 h-4 rounded object-cover" onError={e => e.target.style.display = 'none'} />}
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function CourtBookings({ academyId }) {
  const { toasts, show: toast } = useToast()

  const [bookings,      setBookings]      = useState([])
  const [meta,          setMeta]          = useState({})
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [payFilter,     setPayFilter]     = useState('')
  const [page,          setPage]          = useState(1)
  const [limit]                           = useState(10)
  const [viewMode,      setViewMode]      = useState('table')
  const [viewBooking,   setViewBooking]   = useState(null)
  const [cancelTarget,  setCancelTarget]  = useState(null)
  const [cancelling,    setCancelling]    = useState(false)

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

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelCourtBooking(cancelTarget._id)
      toast('Booking cancelled successfully', 'success')
      setCancelTarget(null)
      setViewBooking(null)
      fetchBookings()
    } catch (err) {
      toast(err?.response?.data?.message || 'Cancel failed', 'error')
    } finally {
      setCancelling(false)
    }
  }

  const handleStatusUpdated = () => {
    fetchBookings()
    if (viewBooking) setViewBooking(prev => prev)
  }

  const handleRowUpdate = async (bookingId, field, value) => {
    try {
      await updateCourtBooking(bookingId, { [field]: value })
      toast(`Updated to "${value}"`, 'success')
      setBookings(prev => prev.map(b =>
        (b._id === bookingId) ? { ...b, [field]: value } : b
      ))
    } catch (err) {
      toast(err?.response?.data?.message || 'Update failed', 'error')
    }
  }

  const handleRowCancel = (booking) => setCancelTarget(booking)

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

  const total     = meta.total     ?? bookings.length
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const revenue   = bookings.reduce((s, b) => s + (b.paymentStatus === 'paid' ? (b.totalPrice || 0) : 0), 0)

  const stats = [
    { label: 'Total Bookings', value: total,        sub: 'all time',  icon: CalendarDays, color: 'bg-purple-600' },
    { label: 'Pending',        value: pending,      sub: 'awaiting',  icon: Hourglass,    color: 'bg-amber-500'  },
    { label: 'Confirmed',      value: confirmed,    sub: 'approved',  icon: CheckCircle,  color: 'bg-green-600'  },
    { label: 'Revenue (₹)',    value: `₹${revenue}`,sub: 'paid only', icon: IndianRupee,  color: 'bg-black'      },
  ]

  const totalPages = meta.totalPages ?? 1

  const InlineSelect = ({ booking, field, options, current }) => {
    const [localLoading, setLocalLoading] = useState(false)
    const isCancelled = booking.status === 'cancelled'

    const handleChange = async (e) => {
      const val = e.target.value
      if (!val || val === current || isCancelled) return
      setLocalLoading(true)
      await handleRowUpdate(booking._id, field, val)
      setLocalLoading(false)
    }

    if (isCancelled) {
      return <StatusBadge status={current} type={field === 'paymentStatus' ? 'payment' : 'booking'} />
    }

    return (
      <div className="relative inline-flex items-center">
        <select
          value={current}
          onChange={handleChange}
          disabled={localLoading}
          className={`
            text-[10px] font-semibold pr-5 pl-2 py-0.5 rounded-full border appearance-none outline-none
            cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait
            ${field === 'paymentStatus'
              ? (PAY_CFG[current]?.color || 'bg-gray-100 text-gray-600')
              : (STATUS_CFG[current]?.color || 'bg-gray-100 text-gray-600')
            }
            border-transparent hover:border-current
          `}
        >
          {options.map(o => (
            <option key={o} value={o} className="bg-white text-gray-800 capitalize">{o}</option>
          ))}
        </select>
        {localLoading
          ? <span className="absolute right-1 h-2.5 w-2.5 border border-gray-500 border-t-transparent rounded-full animate-spin pointer-events-none" />
          : <ChevronDown className="absolute right-1 h-2.5 w-2.5 pointer-events-none opacity-60" />
        }
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <CancelModal
        booking={cancelTarget}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />

      <BookingDetailModal
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
        onCancelClick={(b) => setCancelTarget(b)}
        onUpdateStatus={handleStatusUpdated}
        toast={toast}
      />

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
        <div className="flex items-center gap-2">
          {/* ── Export Button ── */}
          <ExportButton
            academyId={academyId}
            statusFilter={statusFilter}
            payFilter={payFilter}
            toast={toast}
          />
          <button onClick={fetchBookings}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
          <input type="text" placeholder="Search user, ground, court, sport..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400" />
        </div>
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
                  {['#','Booking ID','Customer','Ground / Court','Sport','Date & Slot','Amount','Status','Payment','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-black font-semibold whitespace-nowrap">{h}</th>
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
                  const user   = b.userId      || {}
                  const item   = b.items?.[0]  || {}
                  const ground = item.groundId  || {}
                  const court  = item.courtId   || {}
                  const sport  = item.sportId   || {}
                  const isCancelled = b.status === 'cancelled'

                  return (
                    <tr key={b._id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${isCancelled ? 'opacity-70' : ''}`}>
                      <td className="px-4 py-3 text-neutral-400 text-xs">{(page - 1) * limit + i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] font-mono text-black truncate max-w-[90px]" title={b._id}>#{b._id?.slice(-6)}</p>
                        <p className="text-[9px] text-neutral-300">{fmtDate(b.createdAt)}</p>
                      </td>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 mb-0.5">
                          <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                          <p className="text-xs font-medium text-black truncate max-w-[100px] capitalize">{ground.name || '—'}</p>
                        </div>
                        <p className="text-[10px] text-neutral-400 pl-4 capitalize">
                          {court.name || '—'} {court.pricePerHour ? `· ₹${court.pricePerHour}/hr` : ''}
                        </p>
                        {b.items?.length > 1 && <p className="text-[9px] text-purple-400 pl-4">+{b.items.length - 1} more</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {sport.image
                            ? <img src={sport.image} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-100" onError={e => e.target.style.display = 'none'} />
                            : <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center"><Dumbbell className="h-2.5 w-2.5 text-purple-400" /></div>
                          }
                          <span className="text-xs text-neutral-600 capitalize">{sport.name || '—'}</span>
                        </div>
                      </td>
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
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-black flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />{b.totalPrice}
                        </p>
                        {b.items?.length > 1 && <p className="text-[10px] text-neutral-400">{b.items.length} items</p>}
                      </td>
                      <td className="px-4 py-3">
                        <InlineSelect booking={b} field="status" options={['pending','confirmed','cancelled']} current={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <InlineSelect booking={b} field="paymentStatus" options={['pending','paid','failed','refunded']} current={b.paymentStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewBooking(b)}
                            className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100" title="View details">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {!isCancelled && (
                            <button onClick={() => handleRowCancel(b)}
                              className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100" title="Cancel booking">
                              <Ban className="h-3.5 w-3.5" />
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
            const user   = b.userId      || {}
            const item   = b.items?.[0]  || {}
            const ground = item.groundId  || {}
            const court  = item.courtId   || {}
            const sport  = item.sportId   || {}
            const isCancelled = b.status === 'cancelled'

            return (
              <div key={b._id} className={`bg-white rounded-2xl border border-neutral-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
                <div className="bg-gradient-to-r from-purple-50 to-white px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400">#{b._id?.slice(-10)}</p>
                    <p className="text-[10px] text-neutral-300">{fmtDate(b.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.paymentStatus} type="payment" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">{user.name || '—'}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email || user.mobile || '—'}</p>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <CalendarDays className="h-3 w-3" />
                    <span>{fmtDate(item.startTime)}</span>
                    {b.items?.length > 1 && <span className="ml-auto text-purple-400">+{b.items.length - 1} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <p className="text-sm font-bold text-black flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />{b.totalPrice}
                    </p>
                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <button onClick={() => handleRowCancel(b)}
                          className="flex items-center gap-1 text-xs text-red-500 border border-red-200 bg-red-50 rounded-lg px-2.5 py-1.5 hover:bg-red-100">
                          <Ban className="h-3 w-3" /> Cancel
                        </button>
                      )}
                      <button onClick={() => setViewBooking(b)}
                        className="flex items-center gap-1 text-xs text-blue-500 border border-blue-200 bg-blue-50 rounded-lg px-3 py-1.5 hover:bg-blue-100">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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