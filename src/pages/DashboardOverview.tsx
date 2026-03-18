import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Server,
  Activity,
  AlertTriangle,
  TrendingUp } from
"lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area } from
"recharts";

const assetData = [
{ category: "Servers", count: 142, status: "active" },
{ category: "Databases", count: 67, status: "active" },
{ category: "Applications", count: 234, status: "active" },
{ category: "Network Devices", count: 89, status: "active" },
{ category: "Storage", count: 34, status: "active" }];


const riskDistribution = [
{ name: "Critical", value: 12, color: "hsl(0, 72%, 51%)" },
{ name: "High", value: 28, color: "hsl(38, 92%, 50%)" },
{ name: "Medium", value: 45, color: "hsl(199, 89%, 48%)" },
{ name: "Low", value: 89, color: "hsl(152, 60%, 40%)" }];


const uptimeData = [
{ month: "Aug", uptime: 99.2 },
{ month: "Sep", uptime: 99.5 },
{ month: "Oct", uptime: 98.8 },
{ month: "Nov", uptime: 99.7 },
{ month: "Dec", uptime: 99.1 },
{ month: "Jan", uptime: 99.6 },
{ month: "Feb", uptime: 99.8 },
{ month: "Mar", uptime: 99.4 }];


const complianceItems = [
{ name: "GDPR", status: "compliant", score: 94 },
{ name: "ISO 27001", status: "review", score: 78 },
{ name: "NIS2", status: "warning", score: 62 },
{ name: "Municipal IT Policy", status: "compliant", score: 91 }];


const recentAlerts = [
{ system: "E-Services Portal", type: "EOL", severity: "critical", time: "2 hours ago" },
{ system: "Payroll System HR+", type: "Vulnerability", severity: "high", time: "5 hours ago" },
{ system: "GIS Platform", type: "Capacity", severity: "medium", time: "1 day ago" },
{ system: "Case Management", type: "Certificate", severity: "high", time: "2 days ago" }];


export default function DashboardOverview() {
  const { role, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const roleRoutes: Record<string, string> = {
      cto: "/overview/cdo",
      cfo: "/overview/finance",
      coo: "/overview/organization",
    };
    if (role && roleRoutes[role]) {
      navigate(roleRoutes[role], { replace: true });
    }
  }, [role, authLoading, isAuthenticated, navigate]);

  // Partner dashboard
  if (!authLoading && isAuthenticated && role === "partner") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome to the Eskilstuna Municipality partner view
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Available APIs" value="—" change="Partner & Public APIs" changeType="neutral" icon={Activity} subtitle="Browse the API catalog" />
          <StatCard title="Knowledge Hub" value="—" change="Experiments & tools" changeType="neutral" icon={TrendingUp} subtitle="Shared learning logs" />
          <StatCard title="System Map" value="—" change="Read-only overview" changeType="neutral" icon={Server} subtitle="Infrastructure topology" />
        </div>
        <div className="bg-card rounded-xl border p-6 card-shadow">
          <h3 className="text-sm font-medium mb-2">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/api" className="text-sm text-primary hover:underline">→ API Catalog</a>
            <a href="/knowledge" className="text-sm text-primary hover:underline">→ Knowledge Hub</a>
            <a href="/system-map" className="text-sm text-primary hover:underline">→ System Map</a>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Infrastructure status for Eskiltuna Municipality — March 2026
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value="566"
          change="+12 last month"
          changeType="neutral"
          icon={Server}
          subtitle="Hardware, software, network" />
        
        <StatCard
          title="Critical Risks"
          value="12"
          change="↓ 3 since last week"
          changeType="positive"
          icon={AlertTriangle}
          subtitle="Requires immediate action" />
        
        <StatCard
          title="Average Uptime"
          value="99.4%"
          change="↑ 0.2% last quarter"
          changeType="positive"
          icon={Activity}
          subtitle="Last 30 days" />
        
        <StatCard
          title="IT Cost / Resident"
          value="2,847 SEK"
          change="↑ 4.2% YoY"
          changeType="negative"
          icon={TrendingUp}
          subtitle="Total cost of ownership" />
        
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Asset Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border p-5 card-shadow lg:col-span-2">
          
          <h3 className="text-sm font-medium mb-4">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={assetData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "13px"
                }} />
              
              <Bar dataKey="count" fill="hsl(199, 89%, 32%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Pie */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border p-5 card-shadow">
          
          <h3 className="text-sm font-medium mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value">
                
                {riskDistribution.map((entry, index) =>
                <Cell key={index} fill={entry.color} />
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {riskDistribution.map((item) =>
            <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium ml-auto">{item.value}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Uptime */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border p-5 card-shadow">
          
          <h3 className="text-sm font-medium mb-4">Uptime (Trend)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={uptimeData}>
              <defs>
                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 14%, 46%)" }} />
              <YAxis domain={[98, 100]} tick={{ fontSize: 11, fill: "hsl(215, 14%, 46%)" }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="uptime"
                stroke="hsl(199, 89%, 48%)"
                fill="url(#uptimeGradient)"
                strokeWidth={2} />
              
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border p-5 card-shadow">
          
          <h3 className="text-sm font-medium mb-4">Compliance</h3>
          <div className="space-y-3">
            {complianceItems.map((item) =>
            <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{item.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor:
                    item.score >= 90 ?
                    "hsl(152, 60%, 40%)" :
                    item.score >= 75 ?
                    "hsl(199, 89%, 48%)" :
                    "hsl(38, 92%, 50%)"
                  }} />
                
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border p-5 card-shadow">
          
          <h3 className="text-sm font-medium mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert, i) =>
            <div key={i} className="flex items-start gap-3">
                <div
                className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                alert.severity === "critical" ?
                "bg-destructive animate-pulse-slow" :
                alert.severity === "high" ?
                "bg-warning" :
                "bg-info"}`
                } />
              
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{alert.system}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.type} · {alert.time}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

}