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
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";


const citizenNavItems = [
  { to: "/bins", label: "Find Nearby Bins", icon: MapPin },
  { to: "/reports", label: "Report Dumping", icon: AlertTriangle },
  { to: "/pickups", label: "Schedule Pickup", icon: Calendar },
  { to: "/routes", label: "Track Vehicles", icon: Truck },
];

const driverNavItems = [{ to: "/driver", label: "My Pickups", icon: Truck }];

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

  const handleConfirmLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">
            ♻️ SWMS Kathmandu
          </h1>
          <p className="text-white/60 text-xs">Ward 15 Pilot</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
        <header className="bg-surface border-b border-black/5 px-6 py-4 flex justify-end items-center gap-4">
          <span className="text-sm text-ink flex items-center gap-2">
            {user?.username}
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs capitalize">
              {user?.role}
            </span>
          </span>
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
