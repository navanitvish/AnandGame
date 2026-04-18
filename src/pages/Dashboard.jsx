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
  BookOpen, Award, Users2, BarChart2,
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

// ── Academy Manager stat cards (no games/users data) ──
const academyStatCards = [
  {
    label: 'My Academies',
    value: 3,
    sub: '2 active sessions',
    trend: '+1',
    up: true,
    icon: GraduationCap,
    accent: 'bg-emerald-600',
    ring: 'ring-emerald-100',
  },
  {
    label: 'Enrolled Students',
    value: '1,248',
    sub: 'across all academies',
    trend: '+9%',
    up: true,
    icon: Users2,
    accent: 'bg-sky-600',
    ring: 'ring-sky-100',
  },
  {
    label: 'Courses Active',
    value: 14,
    sub: '3 pending review',
    trend: '+3',
    up: true,
    icon: BookOpen,
    accent: 'bg-violet-600',
    ring: 'ring-violet-100',
  },
  {
    label: 'Avg Score',
    value: '82%',
    sub: 'student performance',
    trend: '+4%',
    up: true,
    icon: Award,
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
const academyEnrollmentData = [
  { name: 'Chess',    students: 320 },
  { name: 'Carrom',   students: 210 },
  { name: 'Ludo',     students: 415 },
  { name: 'Snakes',   students: 175 },
  { name: 'Checkers', students: 128 },
]
const academyCourseStatus    = [
  { name: 'Active',   value: 14 },
  { name: 'Draft',    value: 3  },
  { name: 'Archived', value: 5  },
]
const ACADEMY_PIE_COLORS = ['#059669', '#6366f1', '#94a3b8']

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

// ══════════════════════════════════════════════════════
//  ADMIN DASHBOARD — full platform view
// ══════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════
//  ACADEMY MANAGER DASHBOARD — academy-only view
//  ✗ No user management stats or table
//  ✗ No games data or charts
//  ✗ No top games section
// ══════════════════════════════════════════════════════
function AcademyManagerDashboard({ user }) {
  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Academy Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Welcome back{user?.name ? `, ${user.name}` : ''} — here's your academy overview.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">
          Academy Manager
        </span>
      </div>

      {/* Stat cards — academy only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {academyStatCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts row — academy data only */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-black">Student Enrollment</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Per academy course</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">This Month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={academyEnrollmentData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {academyEnrollmentData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#059669' : '#6ee7b7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-black">Course Status</h2>
            <p className="text-xs text-neutral-400 mt-0.5">By publish state</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={academyCourseStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {academyCourseStatus.map((_, i) => (
                  <Cell key={i} fill={ACADEMY_PIE_COLORS[i % ACADEMY_PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {academyCourseStatus.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ACADEMY_PIE_COLORS[i] }} />
                <span className="text-[10px] text-neutral-500">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — students + performance, no games/users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent students */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-black">Recent Students</h2>
            <a href="/academy/students" className="text-[11px] text-emerald-600 hover:underline font-medium">View all →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Name', 'Course', 'Score', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 text-[11px] text-neutral-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, name: 'Arjun Sharma', course: 'Chess Advanced',  score: '91%', status: 'Active'   },
                { id: 2, name: 'Priya Mehta',  course: 'Carrom Basics',   score: '78%', status: 'Active'   },
                { id: 3, name: 'Rohit Verma',  course: 'Ludo Strategy',   score: '85%', status: 'Active'   },
                { id: 4, name: 'Sneha Patel',  course: 'Chess Beginner',  score: '62%', status: 'Inactive' },
                { id: 5, name: 'Kiran Joshi',  course: 'Checkers Pro',    score: '88%', status: 'Active'   },
              ].map((s) => (
                <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-emerald-700 text-[10px] font-bold">{s.name.charAt(0)}</span>
                      </div>
                      <span className="text-black text-xs font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-neutral-500 text-xs">{s.course}</td>
                  <td className="py-2.5 text-xs font-bold text-emerald-600">{s.score}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          {/* Performance bars */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-black">Performance Summary</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Completion Rate', value: 74, color: 'bg-emerald-500' },
                { label: 'Pass Rate',       value: 88, color: 'bg-sky-500'     },
                { label: 'Attendance',      value: 91, color: 'bg-violet-500'  },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold text-black">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming sessions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex-1">
            <h2 className="text-sm font-semibold text-black mb-3">Upcoming Sessions</h2>
            <div className="space-y-2.5">
              {[
                { title: 'Chess Intermediate', time: 'Today, 4:00 PM',  students: 18 },
                { title: 'Carrom Advanced',    time: 'Tomorrow, 10 AM', students: 12 },
                { title: 'Ludo Strategy',      time: 'Sat, 2:00 PM',    students: 24 },
              ].map((s) => (
                <div key={s.title} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap size={11} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-black font-medium truncate">{s.title}</p>
                      <p className="text-[10px] text-neutral-400">{s.time}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                    {s.students}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  ROOT — routes to correct dashboard by role
// ══════════════════════════════════════════════════════
export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'admin'

  return role === 'academy_manager'
    ? <AcademyManagerDashboard user={user} />
    : <AdminDashboard user={user} />
}