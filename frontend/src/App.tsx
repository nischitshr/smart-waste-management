import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Bins from './pages/Bins'
import Layout from './components/Layout'
import ReportDumping from './pages/ReportDumping'
import SchedulePickup from './pages/SchedulePickup'
import TrackVehicles from './pages/TrackVehicles'
import DriverOverview from './pages/DriverOverview'
import DriverPickups from './pages/DriverPickups'
import DriverBins from './pages/DriverBins'
import AdminDashboard from './pages/AdminDashboard'
import AdminBins from './pages/AdminBins'
import { ToastProvider } from './context/ToastContext'
import AdminPickups from './pages/AdminPickups'
import Register from './pages/Register'
import AdminReports from './pages/AdminReports'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

// Sends the logged-in user to the right home page based on their role,
// instead of always redirecting everyone to /bins.
function RoleHome() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (user.role === 'driver') return <Navigate to="/driver" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/bins" replace />
}

// Sends unmatched paths to a safe page instead of always forcing /login,
// so a bad/unmatched link (e.g. from a notification) never looks like a logout.
function CatchAll() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  return <Navigate to={user ? '/bins' : '/login'} replace />
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleHome />} />
              <Route path="dashboard" element={<RoleHome />} />
              <Route path="bins" element={<Bins />} />
              <Route path="reports" element={<ReportDumping />} />
              <Route path="pickups" element={<SchedulePickup />} />
              <Route path="routes" element={<TrackVehicles />} />
              <Route path="driver" element={<DriverOverview />} />
              <Route path="driver/pickups" element={<DriverPickups />} />
              <Route path="driver/bins" element={<DriverBins />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/bins" element={<AdminBins />} />
              <Route path="admin/pickups" element={<AdminPickups />} />
              <Route path="admin/reports" element={<AdminReports />} />
              <Route path="admin/reports/:id" element={<AdminReports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<CatchAll />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App