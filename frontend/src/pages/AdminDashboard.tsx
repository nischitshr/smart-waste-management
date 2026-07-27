import { useState, useEffect } from 'react'
import { BarChart3, Package, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'

interface StatusCount {
  status: string
  count: number
}

interface Summary {
  pickups_by_status: StatusCount[]
  reports_by_status: StatusCount[]
  total_pickups: number
  total_reports: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#0ea5e9',
  completed: '#10b981',
  cancelled: '#ef4444',
  resolved: '#10b981',
  reported: '#f59e0b',
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await api.get('/analytics/summary/')
      setSummary(res.data)
    } catch (err) {
      console.error(err)
      setError('Could not load analytics data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-ink/40">Loading analytics...</div>
  }

  if (error || !summary) {
    return <div className="p-6 text-sm text-danger">{error || 'No data available.'}</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> Ward 15 Overview
      </h2>
      <p className="text-ink/60 mb-6">Pickup and dumping report activity across the ward.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-5 flex items-center gap-4">
          <div className="bg-primary/10 text-primary rounded-xl p-3">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{summary.total_pickups}</p>
            <p className="text-sm text-ink/60">Total Pickups</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-5 flex items-center gap-4">
          <div className="bg-warning/10 text-warning rounded-xl p-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{summary.total_reports}</p>
            <p className="text-sm text-ink/60">Total Dumping Reports</p>
          </div>
        </div>
      </div>

      {/* Pickups chart */}
      <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
        <h3 className="font-semibold text-ink mb-4">Pickup Requests by Status</h3>
        {summary.pickups_by_status.length === 0 ? (
          <p className="text-sm text-ink/40">No pickup data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.pickups_by_status}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000000d" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} className="capitalize" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {summary.pickups_by_status.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Reports chart */}
      <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-6">
        <h3 className="font-semibold text-ink mb-4">Dumping Reports by Status</h3>
        {summary.reports_by_status.length === 0 ? (
          <p className="text-sm text-ink/40">No dumping report data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.reports_by_status}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000000d" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {summary.reports_by_status.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}