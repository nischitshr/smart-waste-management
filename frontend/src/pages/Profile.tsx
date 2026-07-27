import { useState, useEffect } from 'react'
import { User as UserIcon, Mail, Phone, Shield, MapPinned } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

interface Profile {
  id: number
  username: string
  email: string
  role: string
  phone: string
  ward: { id: number; number: number; name: string } | null
}

export default function Profile() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile/')
      setProfile(res.data)
      setEmail(res.data.email)
      setPhone(res.data.phone)
    } catch (err) {
      console.error(err)
      showToast('Could not load profile.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/users/profile/', { email, phone })
      setProfile(res.data)
      showToast('Profile updated.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-ink/40">Loading profile...</div>
  if (!profile) return null

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-primary" /> My Profile
      </h2>
      <p className="text-ink/60 mb-6">View and update your account details.</p>

      <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Username</label>
          <div className="flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2.5 text-sm bg-black/5 text-ink/60">
            <UserIcon className="w-4 h-4" /> {profile.username}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
          <div className="flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2.5 text-sm bg-black/5 text-ink/60 capitalize">
            <Shield className="w-4 h-4" /> {profile.role}
          </div>
        </div>

        {profile.ward && (
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Ward</label>
            <div className="flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2.5 text-sm bg-black/5 text-ink/60">
              <MapPinned className="w-4 h-4" /> Ward {profile.ward.number} — {profile.ward.name}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white rounded-xl py-2.5 font-medium hover:bg-primary-light transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}