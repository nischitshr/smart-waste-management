import { useEffect, useState } from 'react'
import { ClipboardList, MapPin, Calendar, UserCheck } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

interface Pickup {
  id: number
  address: string
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  assigned_driver: number | null
  created_at: string
}

interface Driver {
  id: number
  username: string
}

export default function AdminPickups() {
  const { showToast } = useToast()
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<Record<number, string>>({})
  const [assigningId, setAssigningId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pickupsRes, driversRes] = await Promise.all([
        api.get('/pickups/'),
        api.get('/users/drivers/'),
      ])
      setPickups(pickupsRes.data.results || [])
      setDrivers(driversRes.data.results || [])
    } catch (err) {
      console.error(err)
      showToast('Could not load pickups or drivers.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (pickupId: number) => {
    const driverId = selectedDriver[pickupId]
    if (!driverId) {
      showToast('Select a driver first.', 'error')
      return
    }
    setAssigningId(pickupId)
    try {
      await api.patch(`/pickups/${pickupId}/assign-driver/`, {
        assigned_driver: Number(driverId),
        status: 'confirmed',
      })
      await fetchData()
      showToast('Driver assigned successfully.', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to assign driver.', 'error')
    } finally {
      setAssigningId(null)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'completed') return 'bg-primary/10 text-primary'
    if (status === 'confirmed') return 'bg-primary/10 text-primary'
    if (status === 'cancelled') return 'bg-danger/10 text-danger'
    return 'bg-warning/10 text-warning'
  }

  const unassigned = pickups.filter((p) => !p.assigned_driver)
  const assigned = pickups.filter((p) => p.assigned_driver)

  const driverName = (id: number | null) => {
    if (!id) return null
    return drivers.find((d) => d.id === id)?.username || `Driver #${id}`
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-primary" /> Manage Pickups
      </h2>
      <p className="text-ink/60 mb-6">Assign drivers to pickup requests.</p>

      {loading && <p className="text-sm text-ink/40">Loading pickups...</p>}

      {!loading && (
        <>
          <h3 className="font-semibold text-ink mb-3">
            Unassigned ({unassigned.length})
          </h3>
          <div className="space-y-3 mb-8">
            {unassigned.length === 0 && (
              <p className="text-sm text-ink/40">All pickups have a driver assigned.</p>
            )}
            {unassigned.map((p) => (
              <div key={p.id} className="bg-surface rounded-2xl shadow-sm border border-warning/20 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-ink flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-ink/40" /> {p.address}
                    </p>
                    <p className="text-sm text-ink/70 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-ink/40" />
                      {new Date(p.scheduled_date).toLocaleDateString()}
                    </p>
                    {p.notes && <p className="text-xs text-ink/50 mt-1">{p.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedDriver[p.id] || ''}
                    onChange={(e) => setSelectedDriver((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select a driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.username}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(p.id)}
                    disabled={assigningId === p.id}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    {assigningId === p.id ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-ink mb-3">Assigned ({assigned.length})</h3>
          <div className="space-y-3">
            {assigned.length === 0 && (
              <p className="text-sm text-ink/40">No pickups assigned yet.</p>
            )}
            {assigned.map((p) => (
              <div key={p.id} className="bg-surface rounded-xl p-4 border border-black/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-ink">{p.address}</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    Driver: {driverName(p.assigned_driver)} · {new Date(p.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}