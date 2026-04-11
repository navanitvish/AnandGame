import { usersData } from '../data/usersData'
import { gamesData } from '../data/gamesData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Users, Gamepad2, Star, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

// ── Derived stats ──────────────────────────────────────
const totalUsers   = usersData.length
const activeUsers  = usersData.filter((u) => u.status === 'Active').length
const totalGames   = gamesData.length
const activeGames  = gamesData.filter((g) => g.status === 'Active').length
const totalPlayers = gamesData.reduce((a, g) => a + g.players, 0)
const avgRating    = (gamesData.reduce((a, g) => a + g.rating, 0) / gamesData.length).toFixed(1)

const statCards = [
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

// ── Bar chart: players per game ────────────────────────
const barData = gamesData.map((g) => ({
  name: g.title.split(' ')[0],
  players: g.players,
}))

// ── Pie chart: genre distribution ─────────────────────
const genreMap = {}
gamesData.forEach((g) => {
  genreMap[g.genre] = (genreMap[g.genre] || 0) + 1
})
const pieData = Object.entries(genreMap).map(([name, value]) => ({ name, value }))

const PIE_COLORS = ['#9333ea', '#1a1a1a', '#a855f7', '#6b21a8', '#d8b4fe', '#3b0764', '#c084fc', '#581c87']

// ── Role donut: users by role ──────────────────────────
const roleMap = {}
usersData.forEach((u) => {
  roleMap[u.role] = (roleMap[u.role] || 0) + 1
})
const roleData = Object.entries(roleMap).map(([name, value]) => ({ name, value }))
const ROLE_COLORS = ['#9333ea', '#000000', '#c084fc']

// ── Custom Tooltip ─────────────────────────────────────
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

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Welcome back — here's what's happening today.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, trend, up, icon: Icon, accent, ring }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border border-neutral-200 p-5 ring-4 ${ring} flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  up
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500'
                }`}
              >
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
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart — Players per Game */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-black">Players per Game</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Total active player counts</p>
            </div>
            <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-1 rounded-full">
              This Month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={28}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
              <Bar dataKey="players" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i % 2 === 0 ? '#9333ea' : '#d8b4fe'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Genre Distribution */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-black">Genre Split</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Games by category</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-[10px] text-neutral-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Users table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-black">Recent Users</h2>
            <a href="/users" className="text-[11px] text-purple-600 hover:underline font-medium">
              View all →
            </a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-2 text-[11px] text-neutral-400 font-medium">Name</th>
                <th className="text-left py-2 text-[11px] text-neutral-400 font-medium">Role</th>
                <th className="text-left py-2 text-[11px] text-neutral-400 font-medium">Joined</th>
                <th className="text-left py-2 text-[11px] text-neutral-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {usersData.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-purple-600 text-[10px] font-bold">
                          {u.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-black text-xs font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'Admin'
                        ? 'bg-black text-white'
                        : u.role === 'Editor'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-neutral-400 text-xs">{u.joined}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.status === 'Active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role donut + top games */}
        <div className="flex flex-col gap-4">

          {/* Role Donut */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-black mb-1">User Roles</h2>
            <p className="text-xs text-neutral-400 mb-3">Role breakdown</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                  ))}
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

          {/* Top Games by Rating */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex-1">
            <h2 className="text-sm font-semibold text-black mb-3">Top Games</h2>
            <div className="space-y-2.5">
              {[...gamesData]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 4)
                .map((g) => (
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