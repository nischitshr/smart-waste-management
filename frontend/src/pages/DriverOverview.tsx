import { useState, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  ListChecks,
  LayoutDashboard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

interface DriverStats {
  total_completed: number;
  completed_this_week: number;
  today_count: number;
  upcoming_count: number;
  daily_activity: { date: string; completed: number }[];
}

// Match this to your actual --color-primary if it differs
const PRIMARY_COLOR = "#1F5D42";

export default function DriverOverview() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/pickups/driver/stats/");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      showToast("Could not load dashboard stats.", "error");
    } finally {
      setStatsLoading(false);
    }
  };

  const statCard = (label: string, value: number, icon: React.ReactNode) => (
    <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </div>
  );

  const formatChartDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <Truck className="w-6 h-6 text-primary" /> Driver Dashboard
      </h2>
      <p className="text-ink/60 mb-6">Your work summary at a glance.</p>

      {statsLoading && (
        <p className="text-sm text-ink/40">Loading dashboard...</p>
      )}

      {!statsLoading && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {statCard(
              "Completed (all time)",
              stats.total_completed,
              <ListChecks className="w-5 h-5 text-primary" />,
            )}
            {statCard(
              "Completed this week",
              stats.completed_this_week,
              <CheckCircle2 className="w-5 h-5 text-primary" />,
            )}
            {statCard(
              "Today",
              stats.today_count,
              <Clock className="w-5 h-5 text-primary" />,
            )}
            {statCard(
              "Upcoming",
              stats.upcoming_count,
              <Calendar className="w-5 h-5 text-primary" />,
            )}
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-5">
            <p className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" /> Activity —
              last 14 days
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.daily_activity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 11, fill: "rgba(0,0,0,0.5)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "rgba(0,0,0,0.5)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  labelFormatter={(label) => formatChartDate(String(label))}
                  formatter={(value) => [String(value), "Completed"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="completed"
                  fill={PRIMARY_COLOR}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!statsLoading && !stats && (
        <p className="text-sm text-ink/40">Could not load dashboard stats.</p>
      )}
    </div>
  );
}
