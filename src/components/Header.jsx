import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Bell, Search, User, Settings,
  ChevronDown, Shield, X, AlertTriangle,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────
function LogoutModal({ show, onConfirm, onCancel }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 mx-4">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">Sign out?</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            You'll need to sign in again to access the admin panel.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, initials, onLogoutClick, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-40">

      {/* User info block */}
      <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-white border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200 flex-shrink-0">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-black truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.email ?? 'admin@example.com'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-purple-500" />
              <span className="text-[10px] text-purple-600 font-semibold">Administrator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        <button
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <User className="w-4 h-4 text-neutral-500 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-black">My Profile</p>
            <p className="text-[10px] text-neutral-400">View & edit profile</p>
          </div>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <Settings className="w-4 h-4 text-neutral-500 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-black">Settings</p>
            <p className="text-[10px] text-neutral-400">App preferences</p>
          </div>
        </button>
      </div>

      {/* Divider + Logout */}
      <div className="p-2 pt-0">
        <div className="h-px bg-neutral-100 mb-2" />
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-black group-hover:text-red-600 transition-colors">Sign out</p>
            <p className="text-[10px] text-neutral-400">End your session</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HEADER
// ══════════════════════════════════════════════════════════════════════════════
export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [notifications, setNotifications] = useState(3) // mock count

  const dropdownRef = useRef(null)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/login')
  }

  return (
    <>
      <LogoutModal
        show={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />

      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 gap-4">

        {/* ── Search ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl px-3 py-2 w-64 transition-colors group">
          <Search size={14} className="text-neutral-400 group-focus-within:text-purple-500 shrink-0 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-neutral-600 outline-none w-full placeholder:text-neutral-400"
          />
        </div>

        {/* ── Right side ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Bell */}
          <button className="relative w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
            <Bell size={16} className="text-neutral-500" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{notifications}</span>
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-200" />

          {/* ── Profile Button + Dropdown ──────────────────────────────────── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150
                ${dropdownOpen ? 'bg-purple-50 ring-1 ring-purple-200' : 'hover:bg-neutral-100'}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-sm shadow-purple-200 flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>

              {/* Name */}
              <div className="hidden sm:block text-left">
                <p className="text-black text-xs font-semibold leading-none">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="text-neutral-400 text-[10px] leading-none mt-0.5">Administrator</p>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={14}
                className={`text-neutral-400 transition-transform duration-200 hidden sm:block
                  ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <ProfileDropdown
                user={user}
                initials={initials}
                onLogoutClick={() => { setDropdownOpen(false); setShowLogoutModal(true) }}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </header>
    </>
  )
}