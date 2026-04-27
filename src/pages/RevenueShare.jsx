import { useState, useMemo } from 'react'
import {
  DollarSign, TrendingUp, Building2, Shield,
  Search, X, Eye, Wallet, Calendar,
  CheckCircle, Clock, XCircle, PieChart
} from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_PCT   = 30
const ACADEMY_PCT = 70

// ── Dummy Data ────────────────────────────────────────────────────────────────
const DUMMY_BOOKINGS = [
  { _id: 'b001', bookingId: 'BK-2024-001', user: { name: 'Rahul Sharma'   }, ground: { name: 'Cricket Ground A'  }, academy: { name: 'Star Sports Academy'   }, amount: 1200, status: 'confirmed', createdAt: '2024-12-01T10:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b002', bookingId: 'BK-2024-002', user: { name: 'Priya Singh'    }, ground: { name: 'Football Turf 1'   }, academy: { name: 'City FC Academy'        }, amount: 800,  status: 'completed', createdAt: '2024-12-02T11:30:00Z', paymentMethod: 'Card'       },
  { _id: 'b003', bookingId: 'BK-2024-003', user: { name: 'Amit Kumar'     }, ground: { name: 'Badminton Court 2' }, academy: { name: 'Smash Badminton Club'   }, amount: 500,  status: 'confirmed', createdAt: '2024-12-03T09:15:00Z', paymentMethod: 'UPI'        },
  { _id: 'b004', bookingId: 'BK-2024-004', user: { name: 'Sneha Verma'    }, ground: { name: 'Tennis Court 1'    }, academy: { name: 'Ace Tennis Academy'     }, amount: 1500, status: 'completed', createdAt: '2024-12-04T14:00:00Z', paymentMethod: 'NetBanking' },
  { _id: 'b005', bookingId: 'BK-2024-005', user: { name: 'Vikram Patel'   }, ground: { name: 'Cricket Ground B'  }, academy: { name: 'Star Sports Academy'   }, amount: 2000, status: 'confirmed', createdAt: '2024-12-05T08:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b006', bookingId: 'BK-2024-006', user: { name: 'Neha Gupta'     }, ground: { name: 'Football Turf 2'   }, academy: { name: 'City FC Academy'        }, amount: 900,  status: 'cancelled', createdAt: '2024-12-06T16:00:00Z', paymentMethod: 'Card'       },
  { _id: 'b007', bookingId: 'BK-2024-007', user: { name: 'Rajesh Tiwari'  }, ground: { name: 'Basketball Court'  }, academy: { name: 'Hoops Academy'          }, amount: 600,  status: 'completed', createdAt: '2024-12-07T12:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b008', bookingId: 'BK-2024-008', user: { name: 'Kavya Nair'     }, ground: { name: 'Badminton Court 1' }, academy: { name: 'Smash Badminton Club'   }, amount: 500,  status: 'confirmed', createdAt: '2024-12-08T10:30:00Z', paymentMethod: 'UPI'        },
  { _id: 'b009', bookingId: 'BK-2024-009', user: { name: 'Arjun Mehta'    }, ground: { name: 'Cricket Ground A'  }, academy: { name: 'Star Sports Academy'   }, amount: 1800, status: 'completed', createdAt: '2024-12-09T07:00:00Z', paymentMethod: 'Card'       },
  { _id: 'b010', bookingId: 'BK-2024-010', user: { name: 'Pooja Yadav'    }, ground: { name: 'Tennis Court 2'    }, academy: { name: 'Ace Tennis Academy'     }, amount: 1200, status: 'pending',   createdAt: '2024-12-10T15:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b011', bookingId: 'BK-2024-011', user: { name: 'Suresh Reddy'   }, ground: { name: 'Football Turf 1'   }, academy: { name: 'City FC Academy'        }, amount: 700,  status: 'confirmed', createdAt: '2024-12-11T11:00:00Z', paymentMethod: 'NetBanking' },
  { _id: 'b012', bookingId: 'BK-2024-012', user: { name: 'Anjali Sharma'  }, ground: { name: 'Cricket Ground B'  }, academy: { name: 'Star Sports Academy'   }, amount: 2500, status: 'completed', createdAt: '2024-12-12T09:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b013', bookingId: 'BK-2024-013', user: { name: 'Rohit Mishra'   }, ground: { name: 'Badminton Court 3' }, academy: { name: 'Smash Badminton Club'   }, amount: 450,  status: 'completed', createdAt: '2024-12-13T13:30:00Z', paymentMethod: 'Card'       },
  { _id: 'b014', bookingId: 'BK-2024-014', user: { name: 'Meena Pillai'   }, ground: { name: 'Basketball Court'  }, academy: { name: 'Hoops Academy'          }, amount: 600,  status: 'pending',   createdAt: '2024-12-14T10:00:00Z', paymentMethod: 'UPI'        },
  { _id: 'b015', bookingId: 'BK-2024-015', user: { name: 'Deepak Joshi'   }, ground: { name: 'Cricket Ground A'  }, academy: { name: 'Star Sports Academy'   }, amount: 1600, status: 'confirmed', createdAt: '2024-12-15T08:30:00Z', paymentMethod: 'UPI'        },
]

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

const isPaid = (status) =>
  ['confirmed', 'completed', 'paid'].includes((status || '').toLowerCase())

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  if (s === 'confirmed' || s === 'completed' || s === 'paid')
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

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ booking, onClose }) {
  if (!booking) return null
  const { total, admin, academy } = calcSplit(booking.amount)

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
              <h3 className="font-bold text-gray-900 text-sm">{booking.bookingId}</h3>
              <p className="text-xs text-gray-400">Revenue Breakdown</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'User',           value: booking.user?.name || '—'   },
              { label: 'Ground',         value: booking.ground?.name || '—' },
              { label: 'Academy',        value: booking.academy?.name || '—'},
              { label: 'Payment',        value: booking.paymentMethod || '—'},
              { label: 'Date',           value: fmtDate(booking.createdAt)  },
              { label: 'Status',         value: <StatusBadge status={booking.status} /> },
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

            {/* Visual bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-2">
              <div className="bg-black h-full" style={{ width: `${ADMIN_PCT}%` }} />
              <div className="bg-purple-500 h-full" style={{ width: `${ACADEMY_PCT}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-4">
              <span>Admin {ADMIN_PCT}%</span>
              <span>Academy {ACADEMY_PCT}%</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 mb-3">
              <span className="text-sm text-gray-500 font-medium">Total Booking Amount</span>
              <span className="text-base font-bold text-gray-900">{fmtCurrency(total)}</span>
            </div>

            {/* Admin share */}
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

            {/* Academy share */}
            <div className="flex items-center justify-between py-2.5 bg-purple-50 rounded-xl px-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{booking.academy?.name || 'Academy'}</p>
                  <p className="text-[10px] text-gray-400">{ACADEMY_PCT}% share</p>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-700">{fmtCurrency(academy)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function RevenueShare() {
  const [bookings]                  = useState(DUMMY_BOOKINGS)
  const [search,       setSearch]   = useState('')
  const [filter,       setFilter]   = useState('all')
  const [viewBooking,  setViewBooking] = useState(null)

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = bookings
    if (filter !== 'all')
      list = list.filter(b => b.status?.toLowerCase() === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.bookingId?.toLowerCase().includes(q)       ||
        b.user?.name?.toLowerCase().includes(q)      ||
        b.ground?.name?.toLowerCase().includes(q)    ||
        b.academy?.name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [bookings, search, filter])

  // ── Stats (only paid bookings count for revenue) ───────────────────────────
  const paidBookings  = bookings.filter(b => isPaid(b.status))
  const totalRevenue  = paidBookings.reduce((s, b) => s + Number(b.amount || 0), 0)
  const totalAdmin    = Math.round(totalRevenue * ADMIN_PCT   / 100)
  const totalAcademy  = Math.round(totalRevenue * ACADEMY_PCT / 100)

  // Filtered footer totals
  const filteredPaidTotal  = filtered.reduce((s, b) => s + (isPaid(b.status) ? Number(b.amount) : 0), 0)
  const filteredAdminTotal = Math.round(filteredPaidTotal * ADMIN_PCT   / 100)
  const filteredAcadTotal  = Math.round(filteredPaidTotal * ACADEMY_PCT / 100)

  const stats = [
    { label: 'Total Revenue',  value: fmtCurrency(totalRevenue), sub: `${paidBookings.length} paid bookings`,                               icon: TrendingUp, color: 'bg-black'      },
    { label: 'Platform Share', value: fmtCurrency(totalAdmin),   sub: `${ADMIN_PCT}% of revenue`,                                           icon: Shield,     color: 'bg-gray-700'   },
    { label: 'Academy Share',  value: fmtCurrency(totalAcademy), sub: `${ACADEMY_PCT}% of revenue`,                                          icon: Building2,  color: 'bg-purple-600' },
    { label: 'Total Bookings', value: bookings.length,            sub: `${bookings.filter(b => b.status === 'pending').length} pending`,      icon: Calendar,   color: 'bg-blue-600'   },
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
            <span className="font-semibold text-black">{ADMIN_PCT}%</span> to Platform &nbsp;·&nbsp;
            <span className="font-semibold text-purple-600">{ACADEMY_PCT}%</span> to Academy
          </p>
        </div>

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
          <span className="text-xs text-neutral-400">Total collected: {fmtCurrency(totalRevenue)}</span>
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
          <input type="text" placeholder="Search booking, user, ground, academy..."
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
              {f === 'all' ? `All (${bookings.length})` : f}
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-400 ml-auto">
          {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['#', 'Booking ID', 'User', 'Ground', 'Academy', 'Date', 'Total Amount', `Platform (${ADMIN_PCT}%)`, `Academy (${ACADEMY_PCT}%)`, 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-14 text-neutral-400 text-sm">
                    <DollarSign className="h-7 w-7 mx-auto mb-2 text-neutral-200" />
                    No bookings found
                  </td>
                </tr>
              ) : filtered.map((b, i) => {
                const { total, admin, academy } = calcSplit(b.amount)
                const paid = isPaid(b.status)

                return (
                  <tr key={b._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                    {/* # */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">{i + 1}</td>

                    {/* Booking ID */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-black">{b.bookingId}</span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-purple-600">
                            {b.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-700 whitespace-nowrap">{b.user?.name || '—'}</span>
                      </div>
                    </td>

                    {/* Ground */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-600 max-w-[110px] truncate block">{b.ground?.name || '—'}</span>
                    </td>

                    {/* Academy */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {b.academy?.name || '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-500 whitespace-nowrap">{fmtDate(b.createdAt)}</span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-black">{fmtCurrency(total)}</span>
                    </td>

                    {/* Admin share */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span className={`text-xs font-semibold ${paid ? 'text-black' : 'text-neutral-300'}`}>
                          {fmtCurrency(admin)}
                        </span>
                        {!paid && <span className="text-[9px] text-neutral-300">(unpaid)</span>}
                      </div>
                    </td>

                    {/* Academy share */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className={`text-xs font-semibold ${paid ? 'text-purple-700' : 'text-neutral-300'}`}>
                          {fmtCurrency(academy)}
                        </span>
                        {!paid && <span className="text-[9px] text-neutral-300">(unpaid)</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>

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

        {/* ── Table Footer ── */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">
              Showing {filtered.length} of {bookings.length} bookings
            </span>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-neutral-500">
                Collected: <span className="font-bold text-black">{fmtCurrency(filteredPaidTotal)}</span>
              </span>
              <span className="text-neutral-200">|</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-black" />
                <span className="text-neutral-500">
                  Platform: <span className="font-bold text-black">{fmtCurrency(filteredAdminTotal)}</span>
                </span>
              </div>
              <span className="text-neutral-200">|</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-purple-500" />
                <span className="text-neutral-500">
                  Academy: <span className="font-bold text-purple-700">{fmtCurrency(filteredAcadTotal)}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}