import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, AlertTriangle, Calendar, Truck } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cards = [
    { title: 'Find Nearby Bins', icon: <MapPin className="w-6 h-6" />, tint: 'bg-primary/10 text-primary', path: '/bins' },
    { title: 'Report Dumping', icon: <AlertTriangle className="w-6 h-6" />, tint: 'bg-danger/10 text-danger', path: '/reports' },
    { title: 'Schedule Pickup', icon: <Calendar className="w-6 h-6" />, tint: 'bg-primary-light/10 text-primary-light', path: '/pickups' },
    { title: 'Track Vehicles', icon: <Truck className="w-6 h-6" />, tint: 'bg-warning/10 text-warning', path: '/routes' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-primary text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">♻️ SWMS Kathmandu</h1>
          <p className="text-white/70 text-sm">Ward 15 Pilot</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user?.username}
            <span className="ml-2 bg-white/15 px-2 py-0.5 rounded-full text-xs capitalize">
              {user?.role}
            </span>
          </span>
          <button onClick={handleLogout} className="hover:text-white/70 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-ink mb-2">
          Welcome, {user?.username}
        </h2>
        <p className="text-ink/60 mb-8">What would you like to do today?</p>

        <div className="grid grid-cols-2 gap-5">
          {cards.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="bg-surface rounded-2xl p-6 flex flex-col items-start gap-4 border border-black/5 hover:border-primary/30 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md text-left"
            >
              <div className={`${card.tint} w-12 h-12 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <span className="font-semibold text-ink">{card.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}