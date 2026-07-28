import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthVisual from '../components/AuthVisual'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Invalid username or password.')
      } else if (err?.response) {
        setError('Something went wrong. Please try again.')
      } else {
        setError('Cannot reach the server. Check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#0d2818] md:bg-bg overflow-hidden">
      {/* Grid texture — mobile only, matches AuthVisual's desktop pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] md:hidden" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-login" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-login)" />
      </svg>

      {/* Mobile-only branding header */}
      <div className="relative z-10 flex md:hidden flex-col px-6 pt-10 pb-6 text-white">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-300/70 uppercase">
          Ward 15 · Kathmandu
        </p>
        <h1
          className="mt-2 text-2xl font-semibold tracking-tight leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Smart Waste Management System
        </h1>
        <p className="text-sm text-white/70 mt-2">Ward 15 — cleaner streets, block by block.</p>
        <p className="mt-3 font-mono text-[11px] text-emerald-300/50 tracking-wide">
          27.7172° N · 85.3240° E
        </p>
      </div>

      <AuthVisual />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm bg-white rounded-2xl px-6 py-8 md:bg-transparent md:rounded-none md:px-0 md:py-0 shadow-xl md:shadow-none">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-ink tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ♻️ Welcome back
            </h1>
            <p className="text-sm text-ink/60 mt-1">Log in to manage waste collection for Ward 15.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary-light disabled:opacity-50 transition"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-ink/60 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}