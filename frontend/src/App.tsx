import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Bins from './pages/Bins'
import Layout from './components/Layout'
import ReportDumping from './pages/ReportDumping'
import SchedulePickup from './pages/SchedulePickup'
import TrackVehicles from './pages/TrackVehicles'
import DriverDashboard from './pages/DriverDashboard'
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
            <Route index element={<Navigate to="/bins" />} />
            <Route path="dashboard" element={<Navigate to="/bins" />} />
            <Route path="bins" element={<Bins />} />
            <Route path="reports" element={<ReportDumping />} />
            <Route path="pickups" element={<SchedulePickup />} />
            <Route path="routes" element={<TrackVehicles />} />
            <Route path="driver" element={<DriverDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/bins" element={<AdminBins />} />
            <Route path="admin/pickups" element={<AdminPickups />} />
            <Route path="admin/reports" element={<AdminReports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  )
}

export default App