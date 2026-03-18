import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldAlert, TrendingUp, TrendingDown, Minus, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  useSystems, useRisks, useApis, useKpiValues,
  dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform, enrichSystems,
  criticalityColors,
} from "@/hooks/useDatabase";
import CitizenImpactCard from "@/components/CitizenImpactCard";

const trendData = [
  { month: "Oct", security: 76, accessibility: 78, capacity: 72 },
  { month: "Nov", security: 74, accessibility: 80, capacity: 74 },
  { month: "Dec", security: 73, accessibility: 82, capacity: 75 },
  { month: "Jan", security: 74, accessibility: 83, capacity: 76 },
  { month: "Feb", security: 74, accessibility: 84, capacity: 77 },
  { month: "Mar", security: 72, accessibility: 85, capacity: 78 },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-success" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function CdoOverview() {
  const { data: rawSystems, isLoading: loadingSys } = useSystems();
  const { data: rawRisks, isLoading: loadingRisks } = useRisks();
  const { data: rawApis, isLoading: loadingApis } = useApis();
  const { data: rawKpis, isLoading: loadingKpis } = useKpiValues("cto");

  const isLoading = loadingSys || loadingRisks || loadingApis || loadingKpis;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const systems = (rawSystems || []).map(dbSystemToPlatform);
  const risks = (rawRisks || []).map(dbRiskToPlatform);
  const apis = (rawApis || []).map(dbApiToPlatform);
  const enriched = enrichSystems(systems, risks, apis);
  const kpis = rawKpis || [];

  const redZoneRisks = risks.filter(r => r.impact * r.likelihood >= 16);
  const systemsNoReview = enriched.filter(s => {
    if (!s.lastReviewDate) return true;
    const d = new Date(s.lastReviewDate);
    const ago = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return ago > 365;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CTO Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Digital strategy & platform health — Eskilstuna Municipality</p>
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
              <p className="text-[10px] text-muted-foreground mt-1 italic hidden group-hover:block">{kpi.helper}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* CIS + Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CitizenImpactCard variant="compact" orgId="org-eskilstuna" />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-4">Digital Maturity Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.1} /><stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.1} /><stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.1} /><stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="security" name="Security" stroke="hsl(0, 72%, 51%)" fill="url(#secGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="accessibility" name="Accessibility" stroke="hsl(199, 89%, 48%)" fill="url(#accGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="capacity" name="Capacity" stroke="hsl(152, 60%, 40%)" fill="url(#capGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-3">Systems by Criticality & Risk</h3>
          <div className="space-y-2">
            {enriched.filter(s => s.criticality === "critical" || s.openRisks.length > 0).slice(0, 8).map(sys => (
              <Link key={sys.id} to={`/system-map?system=${sys.id}`} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-secondary transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: criticalityColors[sys.criticality] || "hsl(var(--muted-foreground))" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sys.name}</p>
                    <p className="text-[10px] text-muted-foreground">{sys.vendor} · {sys.lifecycle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {sys.openRisks.length > 0 && <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">{sys.openRisks.length} risk{sys.openRisks.length > 1 ? "s" : ""}</Badge>}
                  <Badge variant="outline" className="text-[10px]">{sys.criticality}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Red-Zone Risks</h3>
          {redZoneRisks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No red-zone risks currently.</p>
          ) : (
            <div className="space-y-2">
              {redZoneRisks.map(risk => {
                const sys = enriched.find(s => s.id === risk.linkedSystemId);
                return (
                  <Link key={risk.id} to={`/risk?risk=${risk.id}`} className="flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <div className="mt-1 h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">{sys?.name} · {risk.type} · Due {risk.dueDate}</p>
                    </div>
                    {risk.boardVisibility && <Badge className="text-[10px] bg-warning/10 text-warning border-warning/20 shrink-0">Board</Badge>}
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-3">Actions Needed</h3>
          <div className="space-y-2">
            {systemsNoReview.length > 0 && (
              <div className="p-3 rounded-lg border bg-warning/5 border-warning/20">
                <p className="text-sm font-medium">{systemsNoReview.length} system(s) with no review in 12+ months</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {systemsNoReview.map(s => s.name).join(", ")}
                </p>
              </div>
            )}
            {[
              { label: "API-first architecture", progress: Math.round((apis.filter(a => a.type === "public" || a.type === "partner").length / Math.max(apis.length, 1)) * 100), to: "/api" },
              { label: "Governance coverage", progress: Math.round((enriched.filter(s => s.linkedGovDocs.length > 0).length / Math.max(enriched.length, 1)) * 100), to: "/governance" },
              { label: "Active systems ratio", progress: Math.round((enriched.filter(s => s.lifecycle === "active").length / Math.max(enriched.length, 1)) * 100), to: "/system-map" },
            ].map((item) => (
              <Link key={item.label} to={item.to} className="block">
                <div className="space-y-1.5 p-2 rounded-lg hover:bg-secondary transition-colors">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
