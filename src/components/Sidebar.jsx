import { NavLink } from 'react-router-dom'
import image from "../assets/logo.png"
import useAuthStore from '../store/authStore'
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Brain,
  Swords,
  Shield,
  Trophy,
  Target,
  ChevronRight,
  MapPin,
  Tag,
  Dumbbell,
  Clock,
  CreditCard,
  Image,
  Building2,
  ScrollText,
  FileText,
  BookOpen,
  Users2,
  BarChart2,
} from 'lucide-react'

// ─────────────────────────────────────────────
// ROLE CONSTANT
// ─────────────────────────────────────────────
const ROLE = {
  ADMIN: 'admin',
  ACADEMY: 'academy_manager',
}

// ─────────────────────────────────────────────
// ADMIN LINKS (FULL ACCESS)
// ─────────────────────────────────────────────
const adminLinks = [
  { path: '/dashboard', label: 'Dashboard', sub: 'Overview & analytics', icon: LayoutDashboard },
  { path: '/users', label: 'Users', sub: 'Manage all users', icon: Users },
  { path: '/academyjoin', label: 'Academy Join', sub: 'Manage all academyjoin', icon: Users },

  { path: '/catgeory', label: 'Category', sub: 'Manage categories', icon: Tag },
  { path: '/games', label: 'Games', sub: 'All active games', icon: Gamepad2 },
  { path: '/venue', label: 'Venue', sub: 'Manage venues', icon: Building2 },
  { path: '/playground', label: 'Join Games', sub: 'City-wise grounds', icon: Dumbbell },
  { path: '/grounds', label: 'grounds', sub: 'Manage Grounds', icon: Clock },
  { path: '/courts', label: 'Courts', sub: 'Manage Courts', icon: Brain },


  { path: '/banners', label: 'Banners', sub: 'Manage banners', icon: Image },
  // { path: '/locations', label: 'Locations', sub: 'Manage locations', icon: MapPin },

  { path: '/bookings', label: 'Bookings', sub: 'Manage Bookings', icon: Building2 },
  { path: '/courtbooking', label: 'Court Bookings', sub: 'Manage Bookings', icon: Clock },
  { path: '/privacy-policys', label: 'Privacy Policy', sub: 'Manage privacy policy', icon: ScrollText },
  { path: '/term-conditions', label: 'Terms & Conditions', sub: 'Manage terms', icon: FileText },
  { path: '/plan', label: 'Plan', sub: 'Manage plans', icon: CreditCard },
  { path: '/revenueShare', label: 'Revenue Share', sub: 'Manage RevenueShare', icon: CreditCard },
]

// ─────────────────────────────────────────────
// ACADEMY MANAGER LINKS (LIMITED)
// ─────────────────────────────────────────────
const academyLinks = [
  { path: '/dashboard', label: 'Dashboard', sub: 'Academy overview', icon: LayoutDashboard },
  { path: '/playground', label: 'Spordround', sub: 'City-wise grounds', icon: Dumbbell },
  { path: '/venue', label: 'Venue', sub: 'Manage venues', icon: Building2 },
  { path: '/grounds', label: 'grounds', sub: 'Manage Grounds', icon: Clock },
  { path: '/courts', label: 'Courts', sub: 'Manage Courts', icon: Brain },

  { path: '/booking', label: 'Bookings', sub: 'Manage Bookings', icon: Clock },
  { path: '/courtbooking', label: 'Court Bookings', sub: 'Manage Bookings', icon: Clock },
  // { path: '/academy/performance', label: 'Performance', sub: 'Track results', icon: BarChart2 },
]

// ─────────────────────────────────────────────
// THEORY BADGES (SAME UI)
// ─────────────────────────────────────────────
const theoryBadges = [
  { icon: Swords, label: 'Zero-Sum', color: 'text-red-400' },
  { icon: Brain, label: 'Minimax', color: 'text-purple-400' },
  { icon: Shield, label: 'Pareto', color: 'text-blue-400' },
  { icon: Trophy, label: 'Cooperative', color: 'text-yellow-400' },
  { icon: Target, label: "Prisoner's", color: 'text-green-400' },
]

// ─────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────
export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || ROLE.ADMIN

  const links = role === ROLE.ACADEMY ? academyLinks : adminLinks

  return (
    <aside className="w-64 h-full bg-neutral-950 flex flex-col border-r border-neutral-800/60 relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#a855f7 1px, transparent 1px),
                            linear-gradient(90deg, #a855f7 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Logo ── */}
      <div className="relative px-5 pt-6 pb-5 border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/50">
              <img src={image} alt="Sami" className="w-8 h-8 object-contain" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-neutral-950" />
          </div>

          <div>
            <h1 className="text-white text-base font-black tracking-wider uppercase leading-none">
              Sami Games
            </h1>
            <p className="text-purple-400 text-[9px] tracking-[0.2em] mt-1 uppercase">
              {role === ROLE.ACADEMY ? 'Academy Panel' : 'Game Theory Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto no-scrollbar">

        <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase px-2 mb-2">
          Strategic Moves
        </p>

        {links.map(({ path, label, sub, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-purple-600/20 border border-purple-500/40'
                : 'hover:bg-neutral-800/60 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive
                    ? 'bg-purple-600 shadow-md shadow-purple-900/50'
                    : 'bg-neutral-800 group-hover:bg-neutral-700'
                  }`}>
                  <Icon size={15} className={isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                    }`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{sub}</p>
                </div>

                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                ) : (
                  <ChevronRight size={12} className="text-neutral-700 group-hover:text-neutral-500" />
                )}

                {isActive && (
                  <div className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Theory Section ── */}
        <div className="mt-5">
          <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase px-2 mb-3">
            Theory Concepts
          </p>

          <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800/60">
            <div className="grid gap-1.5">
              {theoryBadges.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-neutral-800/60 transition">
                  <Icon size={12} className={color} />
                  <span className="text-[11px] text-neutral-500">{label}</span>
                  <span className="ml-auto text-[9px] text-neutral-700">▸</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </nav>
    </aside>
  )
}