import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  MapPin,
  AlertTriangle,
  Calendar,
  Truck,
  BarChart3,
  ClipboardList,
  User as UserIcon,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import NotificationBell from "./NotificationBell";


const citizenNavItems = [
  { to: "/bins", label: "Find Nearby Bins", icon: MapPin },
  { to: "/reports", label: "Report Dumping", icon: AlertTriangle },
  { to: "/pickups", label: "Schedule Pickup", icon: Calendar },
  { to: "/routes", label: "Track Vehicles", icon: Truck },
];

const driverNavItems = [
  { to: "/driver", label: "Dashboard", icon: LayoutDashboard },
  { to: "/driver/pickups", label: "My Pickups", icon: Truck },
  { to: "/driver/bins", label: "Ward Bins", icon: MapPin },
];

const adminNavItems = [
  { to: "/admin", label: "Analytics", icon: BarChart3 },
  { to: "/admin/bins", label: "Manage Bins", icon: MapPin },
  { to: "/admin/pickups", label: "Manage Pickups", icon: ClipboardList },
  { to: "/admin/reports", label: "Dumping Reports", icon: AlertTriangle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems =
    user?.role === "driver"
      ? driverNavItems
      : user?.role === "admin"
        ? adminNavItems
        : citizenNavItems;
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  const handleNavClick = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[1000] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed off-canvas drawer on mobile, static column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-[1001] w-64 bg-primary text-white flex flex-col shrink-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              ♻️ SWMS Kathmandu
            </h1>
            <p className="text-white/60 text-xs">Ward 15 Pilot</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/70 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/driver"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-black/5 px-4 md:px-6 py-4 flex justify-between md:justify-end items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-ink/60 hover:text-primary p-2 -ml-2 rounded-lg hover:bg-primary/5"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-ink flex items-center gap-2">
              <span className="hidden sm:inline">{user?.username}</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs capitalize">
                {user?.role}
              </span>
            </span>
            <NotificationBell />
            <button
              onClick={() => navigate("/profile")}
              className="text-ink/50 hover:text-primary transition p-2 rounded-lg hover:bg-primary/5"
            >
              <UserIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              className="text-ink/50 hover:text-danger transition p-2 rounded-lg hover:bg-danger/5"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You'll need to log in again to access your dashboard."
        confirmLabel="Log out"
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
