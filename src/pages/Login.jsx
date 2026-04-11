// Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Lock, Mail, ArrowRight,
  Armchair, Package, LayoutDashboard, Users2, ShieldCheck,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

const features = [
  { icon: LayoutDashboard, label: 'Dashboard Analytics', color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-200' },
  { icon: Users2,          label: 'Customer Management', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { icon: Package,         label: 'Product Control',     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  { icon: ShieldCheck,     label: 'Secure & Reliable',   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
]

export default function Login() {
  const navigate   = useNavigate()
  const login      = useAuthStore((s) => s.login)      // ← now calls real API internally
  const clearError = useAuthStore((s) => s.clearError)

  const [formData,     setFormData]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)
  const [error,        setError]        = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) { setError(''); clearError() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    setError('')

    // login() now sends { type: 'email', email, password, role, fcmToken }
    const result = await login({
      email:    formData.email.trim(),
      password: formData.password,
    })

    setIsLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left: Form ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">

        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-purple-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative w-full max-w-md z-10">

          {/* Logo + Brand */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-300">
                  <Armchair className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
                  <Package className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-black leading-none">Anand</div>
                <div className="text-sm font-semibold text-purple-600 leading-none mt-0.5">Game Admin Panel</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in to manage your panel</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="group">
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-purple-600 transition-colors pointer-events-none z-10" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black placeholder-neutral-400
                               focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-purple-600 transition-colors pointer-events-none z-10" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-black placeholder-neutral-400
                               focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors p-0.5 rounded"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-neutral-500 cursor-pointer hover:text-black transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-neutral-300 accent-purple-600 cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700
                           disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold text-white
                           transition-all duration-200 shadow-md shadow-purple-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Don't have access?{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
              Contact Administrator
            </a>
          </p>
          <p className="text-neutral-400 text-xs text-center mt-3">
            Anand Game Admin &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ── Right: Brand Panel ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-l border-neutral-100">
        <div className="absolute inset-0 bg-purple-50" />
        <div className="pointer-events-none absolute -top-20 right-10  h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #7c3aed 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-14 text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-3xl bg-purple-300/30 blur-2xl" />
            <div className="relative h-32 w-32 rounded-3xl bg-purple-600 flex items-center justify-center shadow-2xl shadow-purple-300">
              <Armchair className="h-16 w-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg animate-pulse">
              <Package className="h-4 w-4 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-black mb-3 leading-tight">Anand Admin</h2>
          <p className="text-neutral-500 text-base max-w-xs leading-relaxed mb-12">
            Your complete game store management platform — products, customers, and analytics in one place.
          </p>
          <div className="w-full max-w-xs space-y-3">
            {features.map(({ icon: Icon, label, color, bg, border }) => (
              <div key={label} className={`flex items-center gap-3 rounded-xl ${bg} border ${border} px-4 py-3`}>
                <div className={`h-8 w-8 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-sm font-semibold text-black">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-2">
            <div className="h-px w-12 bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">Powered by Anand Technologies</span>
            <div className="h-px w-12 bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  )
}