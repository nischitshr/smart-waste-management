import { useState, useEffect } from 'react'
import { User as UserIcon, Mail, Phone, Shield, MapPinned, Lock } from 'lucide-react'
import api from '../api/axios'
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Fill in all password fields.', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error')
      return
    }

    setChangingPassword(true)
    try {
      await api.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      showToast('Password updated successfully.', 'success')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error(err)
      const apiMessage =
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        err?.response?.data?.detail
      showToast(apiMessage || 'Failed to update password.', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-ink/40">Loading profile...</div>
  if (!profile) return null

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div>
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

      <div>
        <h3 className="text-lg font-semibold text-ink mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Change Password
        </h3>
        <p className="text-ink/60 text-sm mb-4">Update your account password.</p>

        <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Current password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-ink/40 mt-1">At least 8 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full bg-primary text-white rounded-xl py-2.5 font-medium hover:bg-primary-light transition disabled:opacity-50"
          >
            {changingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  )
}