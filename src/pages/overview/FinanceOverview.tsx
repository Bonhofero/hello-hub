import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Clock, Loader2, Lightbulb, CheckCircle2, Users, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip as ReTooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, Cell, LineChart, Line,
} from "recharts";
import {
  useSystems, useRisks, useApis, useVendors, useContracts, useKpiValues,
  useOpportunityCostItems, useCitizenImpactScore, useCitizenImpactHistory,
  dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform, dbOpportunityCostToPlatform, enrichSystems,
} from "@/hooks/useDatabase";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-success" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function FinanceOverview() {
  const { data: rawSystems, isLoading: l1 } = useSystems();
  const { data: rawRisks, isLoading: l2 } = useRisks();
  const { data: rawApis, isLoading: l3 } = useApis();
  const { data: rawVendors, isLoading: l4 } = useVendors();
  const { data: rawContracts, isLoading: l5 } = useContracts();
  const { data: rawKpis, isLoading: l6 } = useKpiValues("cfo");
  const { data: rawOpc, isLoading: l7 } = useOpportunityCostItems();
  const cis = useCitizenImpactScore("org-eskilstuna");
  const { data: cisHistory } = useCitizenImpactHistory("org-eskilstuna");

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l7;

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
  const contracts = rawContracts || [];
  const kpis = rawKpis || [];
  const opcItems = (rawOpc || []).map(dbOpportunityCostToPlatform);

  // Build cost by department
  const deptMap: Record<string, { maintenance: number; development: number }> = {};
  systems.forEach(s => {
    const dept = s.department || "Other";
    if (!deptMap[dept]) deptMap[dept] = { maintenance: 0, development: 0 };
    deptMap[dept].maintenance += s.maintenanceCost / 1000;
    deptMap[dept].development += s.developmentCost / 1000;
  });
  const costByUnit = Object.entries(deptMap)
    .map(([unit, costs]) => ({ unit: unit.length > 14 ? unit.slice(0, 12) + "…" : unit, maintenance: Math.round(costs.maintenance * 10) / 10, development: Math.round(costs.development * 10) / 10 }))
    .sort((a, b) => (b.maintenance + b.development) - (a.maintenance + a.development));

  // Top vendors by cost
  const vendorCostMap: Record<string, { cost: number; systems: number; lockIn: string }> = {};
  systems.forEach(s => {
    const vName = s.vendor || "Unknown";
    if (!vendorCostMap[vName]) vendorCostMap[vName] = { cost: 0, systems: 0, lockIn: s.lockInRisk };
    vendorCostMap[vName].cost += s.annualCost / 1000;
    vendorCostMap[vName].systems += 1;
  });
  const topVendors = Object.entries(vendorCostMap)
    .map(([vendor, v]) => ({ vendor, cost: Math.round(v.cost * 10) / 10, systems: v.systems, lockIn: v.lockIn }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 7);

  // Scatter data
  const costRiskScatter = enriched.map(s => ({
    name: s.name, cost: Math.round(s.annualCost / 100) / 10, risks: s.openRisks.length, criticality: s.criticality,
  }));

  const highCostHighRisk = enriched.filter(s => s.annualCost > 2000 && s.openRisks.length > 0);

  // Contracts expiring within 6 months
  const soonContracts = contracts.filter(c => {
    if (!c.end_date) return false;
    const diff = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff < 180;
  });

  // Opportunity cost
  const unadoptedOpc = opcItems.filter(o => !o.adopted);
  const totalOpportunityCost = unadoptedOpc.reduce((s, o) => s + o.potentialSaving, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">IT cost management & budget oversight — Eskilstuna Municipality</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
        {/* Public Value ROI card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: kpis.length * 0.04 }}
          className="bg-card rounded-xl border p-4 card-shadow group"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Public Value ROI</p>
            <TooltipProvider>
              <ReTooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Measures citizen-facing value generated per resident IT investment. Higher CIS with lower cost per resident = stronger public value ROI.
                </TooltipContent>
              </ReTooltip>
            </TooltipProvider>
          </div>
          <p className="text-2xl font-semibold tracking-tight" style={{ color: cis.bandColor }}>{cis.score}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Citizen impact per resident investment</p>
          {(cisHistory || []).length > 1 && (
            <div className="mt-1.5">
              <ResponsiveContainer width="100%" height={32}>
                <LineChart data={(cisHistory || []).map((h: any) => ({ score: h.score }))}>
                  <Line type="monotone" dataKey="score" stroke={cis.bandColor} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-1">Maintenance vs. Development Spend by Unit</h3>
          <p className="text-xs text-muted-foreground mb-4">MSEK per year</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costByUnit} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="unit" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip formatter={(v: number) => `${v} MSEK`} contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="maintenance" name="Maintenance" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="development" name="Development" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} barSize={14} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-3">Top Vendors by IT Spend</h3>
          <div className="space-y-2">
            {topVendors.map((v, i) => (
              <div key={v.vendor} className="flex items-center justify-between p-2.5 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{v.vendor}</p>
                    <p className="text-[10px] text-muted-foreground">{v.systems} system{v.systems > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${v.lockIn === "high" ? "border-destructive/30 text-destructive" : v.lockIn === "medium" ? "border-warning/30 text-warning" : ""}`}>
                    {v.lockIn} lock-in
                  </Badge>
                  <span className="text-sm font-semibold">{v.cost} MSEK</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-1">Cost vs. Risk Concentration</h3>
          <p className="text-xs text-muted-foreground mb-4">Systems plotted by annual cost and open risk count</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="cost" name="Cost (MSEK)" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Annual Cost (MSEK)", position: "bottom", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="number" dataKey="risks" name="Risks" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Open Risks", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <ZAxis range={[60, 200]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-card border rounded-lg p-2 text-xs shadow-md">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-muted-foreground">Cost: {d.cost} MSEK · Risks: {d.risks}</p>
                  </div>
                );
              }} />
              <Scatter data={costRiskScatter}>
                {costRiskScatter.map((entry, i) => (
                  <Cell key={i} fill={entry.criticality === "critical" ? "hsl(0, 72%, 51%)" : entry.criticality === "high" ? "hsl(38, 92%, 50%)" : "hsl(199, 89%, 48%)"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-3">Actions Needed</h3>
          <div className="space-y-2">
            {highCostHighRisk.length > 0 && (
              <Link to="/cost" className="block p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <p className="text-sm font-medium">{highCostHighRisk.length} high-cost system(s) with open risks</p>
                <p className="text-xs text-muted-foreground mt-0.5">{highCostHighRisk.map(s => `${s.name} (${(s.annualCost / 1000).toFixed(1)} MSEK)`).join(", ")}</p>
              </Link>
            )}
            {(() => {
              const legacySystems = systems.filter(s => s.lifecycle === "legacy" || s.lifecycle === "end-of-life");
              const totalCost = systems.reduce((sum, s) => sum + s.annualCost, 0);
              const legacyCost = legacySystems.reduce((sum, s) => sum + s.annualCost, 0);
              const pct = totalCost > 0 ? Math.round((legacyCost / totalCost) * 100) : 0;
              return (
                <Link to="/cost" className="block p-3 rounded-lg border hover:bg-secondary transition-colors">
                  <p className="text-sm font-medium">Legacy cost pressure: {pct}% of IT budget</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{legacySystems.length} legacy system(s) consuming {(legacyCost / 1000).toFixed(1)} MSEK</p>
                </Link>
              );
            })()}
            {totalOpportunityCost > 0 && (
              <Link to="/cost?tab=opportunity" className="block p-3 rounded-lg border border-success/20 bg-success/5 hover:bg-success/10 transition-colors">
                <p className="text-sm font-medium">Opportunity cost: {totalOpportunityCost} kSEK/yr potential savings</p>
                <p className="text-xs text-muted-foreground mt-0.5">{unadoptedOpc.length} function(s) with peer-benchmarked savings potential</p>
              </Link>
            )}
            {soonContracts.length > 0 && (
              <Link to="/governance" className="block p-3 rounded-lg border hover:bg-secondary transition-colors">
                <p className="text-sm font-medium">{soonContracts.length} contract(s) expiring within 6 months</p>
                <p className="text-xs text-muted-foreground mt-0.5">{soonContracts.map(c => c.title).join(", ")}</p>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
