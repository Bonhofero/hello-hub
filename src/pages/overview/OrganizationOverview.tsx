import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  useGovernanceDocs, useContradictions, useKpiValues,
  dbGovDocToPlatform, dbContradictionToPlatform, getReviewStatus,
} from "@/hooks/useDatabase";
import CitizenImpactCard from "@/components/CitizenImpactCard";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-success" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const servicePerformance = [
  { dept: "Social Svcs", avgDays: 4.1, target: 5 },
  { dept: "Education", avgDays: 2.8, target: 3 },
  { dept: "Urban Plan", avgDays: 8.2, target: 10 },
  { dept: "IT & Digital", avgDays: 1.4, target: 2 },
  { dept: "HR", avgDays: 3.6, target: 4 },
  { dept: "Culture", avgDays: 2.1, target: 3 },
];

const strategicGoals = [
  { goal: "Increased digital accessibility for residents", initiatives: 5, status: "on-track" },
  { goal: "Streamlined internal administrative processes", initiatives: 8, status: "on-track" },
  { goal: "Strengthened information security & GDPR", initiatives: 3, status: "at-risk" },
  { goal: "Sustainable urban development & digitalisation", initiatives: 4, status: "on-track" },
];

export default function OrganizationOverview() {
  const { data: rawDocs, isLoading: l1 } = useGovernanceDocs();
  const { data: rawContradictions, isLoading: l2 } = useContradictions();
  const { data: rawKpis, isLoading: l3 } = useKpiValues("coo");

  const isLoading = l1 || l2 || l3;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docs = (rawDocs || []).map(dbGovDocToPlatform);
  const contradictions = (rawContradictions || []).map(dbContradictionToPlatform);
  const kpis = rawKpis || [];

  const overdueDocs = docs.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue");
  const escalated = docs.filter(d => d.escalatedToBoard);
  const unresolvedContradictions = contradictions.filter(c => !c.resolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Strategic overview & organisational health — Eskilstuna Municipality</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={kpi.id} to={kpi.link_to || "/"}>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border p-4 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer group"
            >
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendIcon trend={kpi.trend || "stable"} />
                <span className="text-xs text-muted-foreground">{kpi.trend_label}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{kpi.last_updated} · {kpi.source}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Citizen & Community */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Citizen & Community</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CitizenImpactCard variant="compact" orgId="org-eskilstuna" />
        </div>
      </div>

      {/* Row 2: Service Performance + Strategic Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-4">Service Processing Time by Department (days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={servicePerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="avgDays" name="Avg Days" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border p-5 card-shadow space-y-3">
          <h3 className="text-sm font-medium">Strategic Goal Alignment</h3>
          {strategicGoals.map((g) => (
            <div key={g.goal} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{g.goal}</p>
                <p className="text-xs text-muted-foreground">{g.initiatives} linked initiatives</p>
              </div>
              <Badge className={`text-[10px] shrink-0 ${g.status === "on-track" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {g.status === "on-track" ? "On Track" : "At Risk"}
              </Badge>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 3: Alerts + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border p-5 card-shadow space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Needs Attention</h3>
          {escalated.length > 0 && (
            <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
              <p className="text-sm font-medium">{escalated.length} item(s) escalated to Board</p>
              <div className="mt-1 space-y-1">
                {escalated.slice(0, 3).map(d => (
                  <p key={d.id} className="text-xs text-muted-foreground">{d.title}</p>
                ))}
              </div>
            </div>
          )}
          {unresolvedContradictions.length > 0 && (
            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="text-sm font-medium">{unresolvedContradictions.length} unresolved contradiction(s)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Documents with conflicting policies require resolution</p>
            </div>
          )}
          {overdueDocs.length > 0 && (
            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="text-sm font-medium">{overdueDocs.length} governance review(s) overdue</p>
              <p className="text-xs text-muted-foreground mt-0.5">{overdueDocs.map(d => d.title).slice(0, 2).join(", ")}{overdueDocs.length > 2 ? ` +${overdueDocs.length - 2} more` : ""}</p>
            </div>
          )}
          {escalated.length === 0 && unresolvedContradictions.length === 0 && overdueDocs.length === 0 && (
            <p className="text-sm text-muted-foreground">No urgent items at this time.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border p-5 card-shadow space-y-2">
          <h3 className="text-sm font-medium mb-1">Quick Actions</h3>
          {[
            { label: "View Governance Portfolio", to: "/governance", desc: "Review documents & compliance" },
            { label: "Knowledge Hub", to: "/knowledge", desc: "Ideas, experiments & learning" },
            { label: "Board Dashboard", to: "/governance?tab=board", desc: "Escalated items & strategic alignment" },
            { label: "Risk Overview", to: "/risk", desc: "Threat landscape & mitigation" },
          ].map((action) => (
            <Link key={action.to} to={action.to} className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary transition-colors group">
              <div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
