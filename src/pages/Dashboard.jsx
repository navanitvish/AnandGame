// Dashboard.jsx
import { usersData } from '../data/usersData'
import { gamesData } from '../data/gamesData'
import useAuthStore from '../store/authStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, Gamepad2, Star, TrendingUp,
  ArrowUpRight, ArrowDownRight, GraduationCap,
  MapPin, LayoutGrid, CalendarCheck, BookOpen,
  Layers, Clock, CheckCircle2, XCircle,
} from 'lucide-react'

// ── Derived stats ──────────────────────────────────────
const totalUsers   = usersData.length
const activeUsers  = usersData.filter((u) => u.status === 'Active').length
const totalGames   = gamesData.length
const activeGames  = gamesData.filter((g) => g.status === 'Active').length
const totalPlayers = gamesData.reduce((a, g) => a + g.players, 0)
const avgRating    = (gamesData.reduce((a, g) => a + g.rating, 0) / gamesData.length).toFixed(1)

// ── Admin stat cards ───────────────────────────────────
const adminStatCards = [
  {
    label: 'Total Users',
    value: totalUsers,
    sub: `${activeUsers} active`,
    trend: '+12%',
    up: true,
    icon: Users,
    accent: 'bg-purple-600',
    ring: 'ring-purple-100',
  },
  {
    label: 'Total Games',
    value: totalGames,
    sub: `${activeGames} active`,
    trend: '+5%',
    up: true,
    icon: Gamepad2,
    accent: 'bg-black',
    ring: 'ring-neutral-100',
  },
  {
    label: 'Total Players',
    value: totalPlayers.toLocaleString(),
    sub: 'across all games',
    trend: '+18%',
    up: true,
    icon: TrendingUp,
    accent: 'bg-purple-500',
    ring: 'ring-purple-100',
  },
  {
    label: 'Avg Rating',
    value: avgRating,
    sub: 'out of 5.0',
    trend: '-0.2',
    up: false,
    icon: Star,
    accent: 'bg-neutral-800',
    ring: 'ring-neutral-100',
  },
]

// ── Academy Manager stat cards ─────────────────────────
// Based on sidebar: Spordround, Grounds, Courts, Bookings, Court Bookings
const academyStatCards = [
  {
    label: 'Total Grounds',
    value: 8,
    sub: '6 active grounds',
    trend: '+2',
    up: true,
    icon: MapPin,
    accent: 'bg-violet-600',
    ring: 'ring-violet-100',
  },
  {
    label: 'Total Courts',
    value: 14,
    sub: '11 active courts',
    trend: '+3',
    up: true,
    icon: LayoutGrid,
    accent: 'bg-emerald-600',
    ring: 'ring-emerald-100',
  },
  {
    label: 'Ground Bookings',
    value: 38,
    sub: 'this month',
    trend: '+22%',
    up: true,
    icon: CalendarCheck,
    accent: 'bg-sky-600',
    ring: 'ring-sky-100',
  },
  {
    label: 'Court Bookings',
    value: 61,
    sub: 'this month',
    trend: '+15%',
    up: true,
    icon: BookOpen,
    accent: 'bg-amber-500',
    ring: 'ring-amber-100',
  },
]

// ── Admin chart data ───────────────────────────────────
const barData = gamesData.map((g) => ({
  name: g.title.split(' ')[0],
  players: g.players,
}))
const genreMap = {}
gamesData.forEach((g) => { genreMap[g.genre] = (genreMap[g.genre] || 0) + 1 })
const pieData    = Object.entries(genreMap).map(([name, value]) => ({ name, value }))
const PIE_COLORS = ['#9333ea', '#1a1a1a', '#a855f7', '#6b21a8', '#d8b4fe', '#3b0764', '#c084fc', '#581c87']

const roleMap = {}
usersData.forEach((u) => { roleMap[u.role] = (roleMap[u.role] || 0) + 1 })
const roleData    = Object.entries(roleMap).map(([name, value]) => ({ name, value }))
const ROLE_COLORS = ['#9333ea', '#000000', '#c084fc']

// ── Academy chart data ─────────────────────────────────
// Grounds bookings by city (Spordround = city-wise grounds)
const spordRoundData = [
  { name: 'Mumbai',    bookings: 124 },
  { name: 'Delhi',     bookings: 98  },
  { name: 'Bangalore', bookings: 87  },
  { name: 'Lucknow',   bookings: 65  },
  { name: 'Pune',      bookings: 52  },
]

// Court bookings this week
const courtBookingsData = [
  { name: 'Mon', bookings: 8  },
  { name: 'Tue', bookings: 14 },
  { name: 'Wed', bookings: 11 },
  { name: 'Thu', bookings: 17 },
  { name: 'Fri', bookings: 22 },
  { name: 'Sat', bookings: 30 },
  { name: 'Sun', bookings: 19 },
]

const bookingStatusData = [
  { name: 'Confirmed', value: 62 },
  { name: 'Pending',   value: 18 },
  { name: 'Cancelled', value: 11 },
]
const BOOKING_PIE_COLORS = ['#7c3aed', '#f59e0b', '#ef4444']

// ── Shared custom tooltip ──────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="text-neutral-500 mb-1 font-medium">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? '#9333ea' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Reusable stat card ─────────────────────────────────
function StatCard({ label, value, sub, trend, up, icon: Icon, accent, ring }) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-5 ring-4 ${ring} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
          up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
        }`}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-black leading-none">{value}</p>
        <p className="text-xs text-neutral-400 mt-1">{label}</p>
      </div>
      <p className="text-[11px] text-neutral-400 border-t border-neutral-100 pt-2">{sub}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — full platform view
// ══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user }) {
  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Welcome back{user?.name ? `, ${user.name}` : ''} — here's the full platform overview.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-black text-white border-black mt-1">
          Administrator
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {adminStatCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-black">Players per Game</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Total active player counts</p>
            </div>
            <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-1 rounded-full">This Month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
              <Bar dataKey="players" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#9333ea' : '#d8b4fe'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-black">Genre Split</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Games by category</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] text-neutral-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-black">Recent Users</h2>
            <a href="/users" className="text-[11px] text-purple-600 hover:underline font-medium">View all →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Name', 'Role', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 text-[11px] text-neutral-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersData.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-purple-600 text-[10px] font-bold">{u.name.charAt(0)}</span>
                      </div>
                      <span className="text-black text-xs font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'Admin' ? 'bg-black text-white'
                      : u.role === 'Editor' ? 'bg-purple-100 text-purple-700'
                      : 'bg-neutral-100 text-neutral-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-2.5 text-neutral-400 text-xs">{u.joined}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          {/* Role donut */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-black mb-1">User Roles</h2>
            <p className="text-xs text-neutral-400 mb-3">Role breakdown</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-1">
              {roleData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[i] }} />
                  <span className="text-[10px] text-neutral-500">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
          {/* Top games */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex-1">
            <h2 className="text-sm font-semibold text-black mb-3">Top Games</h2>
            <div className="space-y-2.5">
              {[...gamesData].sort((a, b) => b.rating - a.rating).slice(0, 4).map((g) => (
                <div key={g.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
                      <Gamepad2 size={11} className="text-purple-600" />
                    </div>
                    <span className="text-xs text-black font-medium truncate">{g.title}</span>
                  </div>
                  <span className="text-xs font-bold text-purple-600 shrink-0 ml-2">★ {g.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACADEMY MANAGER DASHBOARD
//  Sidebar pages: Spordround, Grounds, Courts, Bookings, Court Bookings
// ══════════════════════════════════════════════════════════════════════════════
function AcademyManagerDashboard({ user }) {

  // Recent ground bookings
  const recentGroundBookings = [
    { id: 1, player: 'Arjun Sharma',  ground: 'Green Valley Ground', city: 'Lucknow',   date: '27 Apr 2026', status: 'Confirmed' },
    { id: 2, player: 'Priya Mehta',   ground: 'Sunrise Sports Park', city: 'Delhi',      date: '27 Apr 2026', status: 'Pending'   },
    { id: 3, player: 'Rohit Verma',   ground: 'City Arena',          city: 'Mumbai',     date: '26 Apr 2026', status: 'Confirmed' },
    { id: 4, player: 'Sneha Patel',   ground: 'Blue Turf Ground',    city: 'Bangalore',  date: '26 Apr 2026', status: 'Cancelled' },
    { id: 5, player: 'Kiran Joshi',   ground: 'Elite Sports Hub',    city: 'Pune',       date: '25 Apr 2026', status: 'Confirmed' },
  ]

  // Recent court bookings
  const recentCourtBookings = [
    { id: 1, player: 'Amit Singh',    court: 'Court A - Badminton', time: 'Today 5:00 PM',    status: 'Confirmed' },
    { id: 2, player: 'Neha Kapoor',   court: 'Court B - Tennis',    time: 'Today 6:30 PM',    status: 'Pending'   },
    { id: 3, player: 'Vikram Das',    court: 'Court C - Squash',    time: 'Tomorrow 8:00 AM', status: 'Confirmed' },
    { id: 4, player: 'Riya Sharma',   court: 'Court A - Badminton', time: 'Tomorrow 4:00 PM', status: 'Confirmed' },
  ]

  const statusStyle = (status) => {
    if (status === 'Confirmed') return 'bg-green-50 text-green-600'
    if (status === 'Pending')   return 'bg-amber-50 text-amber-600'
    return 'bg-red-50 text-red-500'
  }

  const StatusIcon = ({ status }) => {
    if (status === 'Confirmed') return <CheckCircle2 size={10} />
    if (status === 'Cancelled') return <XCircle size={10} />
    return <Clock size={10} />
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Academy Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Welcome back{user?.name ? `, ${user.name}` : ''} — here's your academy overview.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200 mt-1">
          Academy Manager
        </span>
      </div>

      {/* Stat cards — Grounds, Courts, Bookings, Court Bookings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {academyStatCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Spordround — city-wise ground bookings bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-violet-600" />
                <h2 className="text-sm font-semibold text-black">Spordround — City-wise Bookings</h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 ml-5">Ground bookings by city this month</p>
            </div>
            <span className="text-[10px] bg-violet-50 text-violet-600 font-semibold px-2 py-1 rounded-full">This Month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spordRoundData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                {spordRoundData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#7c3aed' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking status donut */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} className="text-sky-600" />
              <h2 className="text-sm font-semibold text-black">Booking Status</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 ml-5">All bookings breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {bookingStatusData.map((_, i) => (
                  <Cell key={i} fill={BOOKING_PIE_COLORS[i % BOOKING_PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {bookingStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: BOOKING_PIE_COLORS[i] }} />
                <span className="text-[10px] text-neutral-500">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Court bookings weekly chart */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-black">Court Bookings — This Week</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 ml-5">Daily court booking volume</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">This Week</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={courtBookingsData} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
            <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
              {courtBookingsData.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? '#059669' : '#6ee7b7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row — recent bookings tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Ground Bookings */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-black">Recent Ground Bookings</h2>
            </div>
            <a href="/bookings" className="text-[11px] text-violet-600 hover:underline font-medium">View all →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Player', 'Ground', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 text-[11px] text-neutral-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentGroundBookings.map((b) => (
                <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-violet-700 text-[9px] font-bold">{b.player.charAt(0)}</span>
                      </div>
                      <span className="text-black text-xs font-medium truncate max-w-[80px]">{b.player}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-neutral-500 text-xs max-w-[100px]">
                    <span className="truncate block">{b.ground}</span>
                    <span className="text-[10px] text-neutral-300">{b.city}</span>
                  </td>
                  <td className="py-2.5 text-neutral-400 text-[10px] whitespace-nowrap">{b.date}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle(b.status)}`}>
                      <StatusIcon status={b.status} />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Court Bookings */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-black">Recent Court Bookings</h2>
            </div>
            <a href="/court-bookings" className="text-[11px] text-emerald-600 hover:underline font-medium">View all →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Player', 'Court', 'Time', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 text-[11px] text-neutral-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCourtBookings.map((b) => (
                <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-emerald-700 text-[9px] font-bold">{b.player.charAt(0)}</span>
                      </div>
                      <span className="text-black text-xs font-medium truncate max-w-[80px]">{b.player}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-neutral-500 text-xs">
                    <span className="truncate block max-w-[110px]">{b.court}</span>
                  </td>
                  <td className="py-2.5 text-neutral-400 text-[10px] whitespace-nowrap">{b.time}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle(b.status)}`}>
                      <StatusIcon status={b.status} />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick summary strip */}
          <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2">
            {[
              { label: 'Available Courts', value: '3', color: 'text-emerald-600' },
              { label: 'Occupied Now',     value: '11', color: 'text-amber-600'  },
              { label: 'Today Total',      value: '22', color: 'text-violet-600' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-neutral-400 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grounds & Courts quick status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Grounds list */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-black">Grounds Overview</h2>
            </div>
            <a href="/grounds" className="text-[11px] text-violet-600 hover:underline font-medium">Manage →</a>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Green Valley Ground', city: 'Lucknow',   courts: 4,  bookings: 18, active: true  },
              { name: 'Sunrise Sports Park', city: 'Delhi',     courts: 6,  bookings: 24, active: true  },
              { name: 'Blue Turf Ground',    city: 'Bangalore', courts: 3,  bookings: 9,  active: true  },
              { name: 'City Arena',          city: 'Mumbai',    courts: 5,  bookings: 31, active: true  },
              { name: 'Elite Sports Hub',    city: 'Pune',      courts: 2,  bookings: 6,  active: false },
            ].map((g) => (
              <div key={g.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-violet-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-black truncate">{g.name}</p>
                    <p className="text-[10px] text-neutral-400">{g.city} · {g.courts} courts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-violet-600 font-semibold">{g.bookings} bookings</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    g.active ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {g.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courts list */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-black">Courts Overview</h2>
            </div>
            <a href="/courts" className="text-[11px] text-emerald-600 hover:underline font-medium">Manage →</a>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Court A',   type: 'Badminton', ground: 'Green Valley', status: 'Available', bookings: 12 },
              { name: 'Court B',   type: 'Tennis',    ground: 'Green Valley', status: 'Occupied',  bookings: 8  },
              { name: 'Court C',   type: 'Squash',    ground: 'Sunrise Park', status: 'Available', bookings: 5  },
              { name: 'Court D',   type: 'Badminton', ground: 'City Arena',   status: 'Occupied',  bookings: 19 },
              { name: 'Court E',   type: 'Football',  ground: 'City Arena',   status: 'Available', bookings: 7  },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <LayoutGrid size={13} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-black">{c.name} <span className="font-normal text-neutral-400">· {c.type}</span></p>
                    <p className="text-[10px] text-neutral-400">{c.ground}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-emerald-600 font-semibold">{c.bookings} bookings</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'Available'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT — routes to correct dashboard by role
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'admin'

  return role === 'academy_manager'
    ? <AcademyManagerDashboard user={user} />
    : <AdminDashboard user={user} />
}