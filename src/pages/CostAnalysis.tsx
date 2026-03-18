import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, PieChart as PieIcon, AlertTriangle, Lightbulb, Info, ChevronDown, ChevronUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  useSystems, useRisks, useApis, useOpportunityCostItems,
  dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform, dbOpportunityCostToPlatform,
  enrichSystems, lifecycleColors,
} from "@/hooks/useDatabase";

export default function CostAnalysis() {
  const [searchParams] = useSearchParams();
  const filterSystem = searchParams.get("system");
  const [tab, setTab] = useState<"cost" | "opportunity">("cost");

  const { data: rawSystems, isLoading } = useSystems();
  const { data: rawRisks } = useRisks();
  const { data: rawApis } = useApis();
  const { data: rawOpc } = useOpportunityCostItems();

  const allApis = useMemo(() => (rawApis || []).map(dbApiToPlatform), [rawApis]);
  const allSystems = useMemo(() => enrichSystems((rawSystems || []).map(dbSystemToPlatform), (rawRisks || []).map(dbRiskToPlatform), allApis), [rawSystems, rawRisks, allApis]);
  const opcItems = useMemo(() => (rawOpc || []).map(dbOpportunityCostToPlatform), [rawOpc]);

  const systems = useMemo(() => {
    if (filterSystem) return allSystems.filter((s) => s.id === filterSystem);
    return allSystems;
  }, [allSystems, filterSystem]);

  const totalCost = systems.reduce((sum, s) => sum + s.annualCost, 0);
  const totalMaint = systems.reduce((sum, s) => sum + s.maintenanceCost, 0);
  const totalDev = systems.reduce((sum, s) => sum + s.developmentCost, 0);

  // Total opportunity cost
  const unadoptedOpc = opcItems.filter(o => !o.adopted);
  const totalOpportunityCost = unadoptedOpc.reduce((s, o) => s + o.potentialSaving, 0);

  const vendorMap = new Map<string, number>();
  systems.forEach((s) => vendorMap.set(s.vendor, (vendorMap.get(s.vendor) || 0) + s.annualCost));
  const vendorData = Array.from(vendorMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value: Math.round(value / 10) / 100 }));
  const vendorColors = ["hsl(199, 89%, 32%)", "hsl(199, 89%, 48%)", "hsl(168, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(262, 52%, 55%)", "hsl(215, 14%, 46%)"];

  const deptMap = new Map<string, { maint: number; dev: number }>();
  systems.forEach((s) => {
    const cur = deptMap.get(s.department) || { maint: 0, dev: 0 };
    cur.maint += s.maintenanceCost;
    cur.dev += s.developmentCost;
    deptMap.set(s.department, cur);
  });
  const deptData = Array.from(deptMap.entries()).map(([dept, v]) => ({ dept, maintenance: Math.round(v.maint / 100) / 10, development: Math.round(v.dev / 100) / 10 })).sort((a, b) => b.maintenance + b.development - (a.maintenance + a.development));

  // Opportunity cost chart data
  const opcChartData = [...unadoptedOpc].sort((a, b) => b.potentialSaving - a.potentialSaving).slice(0, 5).map(o => ({
    name: o.functionName.length > 20 ? o.functionName.slice(0, 18) + "…" : o.functionName,
    currentCost: o.yourCost,
    peerCostWithApi: o.peerAverageCost,
  }));

  const [expandedPeerItem, setExpandedPeerItem] = useState<string | null>(null);

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading cost data…</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cost Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Total cost of ownership
          {filterSystem && (() => { const s = allSystems.find((x) => x.id === filterSystem); return s ? ` — ${s.name}` : ""; })()}
        </p>
        {filterSystem && <Link to="/cost" className="text-xs text-primary hover:underline">← Clear filter · Show all systems</Link>}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setTab("cost")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "cost" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <DollarSign className="h-4 w-4" /> Cost Overview
        </button>
        <button onClick={() => setTab("opportunity")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "opportunity" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Lightbulb className="h-4 w-4" /> Opportunity Cost
        </button>
      </div>

      {tab === "cost" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total IT Cost" value={`${(totalCost / 1000).toFixed(1)} MSEK`} change="FY 2025/2026" changeType="neutral" icon={DollarSign} />
            <StatCard title="Maintenance" value={totalCost > 0 ? `${Math.round(totalMaint / totalCost * 100)}%` : "0%"} change={`${(totalMaint / 1000).toFixed(1)} MSEK`} changeType="negative" icon={TrendingUp} />
            <StatCard title="Development" value={totalCost > 0 ? `${Math.round(totalDev / totalCost * 100)}%` : "0%"} change={`${(totalDev / 1000).toFixed(1)} MSEK`} changeType="positive" icon={TrendingDown} />
            <StatCard title="Vendor Concentration" value={`${vendorData.length} vendors`} change={`Top 3 = ${totalCost > 0 ? Math.round(vendorData.slice(0, 3).reduce((s, v) => s + v.value, 0) / (totalCost / 1000) * 100) : 0}%`} changeType="neutral" icon={PieIcon} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-5 card-shadow lg:col-span-2">
              <h3 className="text-sm font-medium mb-1">Maintenance vs. Development by Department</h3>
              <p className="text-xs text-muted-foreground mb-4">MSEK per year</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 14%, 46%)" }} />
                  <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: "hsl(215, 14%, 46%)" }} width={140} />
                  <Tooltip formatter={(v: number) => `${v} MSEK`} contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(214, 20%, 90%)" }} />
                  <Bar dataKey="maintenance" name="Maintenance" fill="hsl(215, 14%, 46%)" barSize={14} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="development" name="Development" fill="hsl(199, 89%, 48%)" barSize={14} radius={[0, 4, 4, 0]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border p-5 card-shadow">
              <h3 className="text-sm font-medium mb-4">Vendor Concentration</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={vendorData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {vendorData.map((_, i) => <Cell key={i} fill={vendorColors[i % vendorColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} MSEK`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {vendorData.map((item, i) =>
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: vendorColors[i % vendorColors.length] }} /><span className="text-muted-foreground">{item.name}</span></div>
                    <span className="font-medium">{item.value} MSEK</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Opportunity Cost summary card that links to tab */}
          {totalOpportunityCost > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="bg-card rounded-xl border p-4 card-shadow cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setTab("opportunity")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">Opportunity Cost: {totalOpportunityCost} kSEK/yr potential savings</p>
                    <p className="text-xs text-muted-foreground">{unadoptedOpc.length} unadopted APIs — click to view details</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">View →</Badge>
              </div>
            </motion.div>
          )}

          {/* System Cost Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border card-shadow overflow-hidden">
            <div className="p-5 border-b"><h3 className="text-sm font-medium">System Cost Registry</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">System</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Owner</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Annual Cost</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Maint.</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Dev.</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Vendor</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contract End</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Lock-in</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Lifecycle</th>
                  </tr>
                </thead>
                <tbody>
                  {[...systems].sort((a, b) => b.annualCost - a.annualCost).map((s) =>
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <Link to={`/system-map?system=${s.id}`} className="font-medium text-primary hover:underline">{s.name}</Link>
                        <p className="text-[10px] text-muted-foreground">{s.department}</p>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{s.owner}</td>
                      <td className="p-3 font-mono text-xs font-medium">{s.annualCost.toLocaleString()}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.maintenanceCost.toLocaleString()}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.developmentCost.toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground text-xs">{s.vendor}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.contractEnd}</td>
                      <td className="p-3"><Badge variant="outline" className={`text-[10px] ${s.lockInRisk === "high" ? "border-destructive/30 text-destructive" : s.lockInRisk === "medium" ? "border-warning/30 text-warning" : ""}`}>{s.lockInRisk}</Badge></td>
                      <td className="p-3"><Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${lifecycleColors[s.lifecycle]}20`, color: lifecycleColors[s.lifecycle] }}>{s.lifecycle}</Badge></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {tab === "opportunity" && (
        <div className="space-y-6">
          {/* Combined total KPI */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-5 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Cost of Not Implementing</p>
                <p className="text-3xl font-semibold tracking-tight mt-1">{totalOpportunityCost} kSEK/yr</p>
                <p className="text-xs text-muted-foreground mt-1">Annual savings potential by adopting peer-validated APIs</p>
              </div>
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                {unadoptedOpc.length} unadopted functions
              </Badge>
            </div>
          </motion.div>

          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border p-5 card-shadow">
            <h3 className="text-sm font-medium mb-1">Top Saving Opportunities — Cost of Not Implementing</h3>
            <p className="text-xs text-muted-foreground mb-4">Current annual cost vs. peer cost with API implemented (kSEK/yr)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={opcChartData} layout="vertical" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={150} />
                <Tooltip formatter={(v: number) => `${v} kSEK`} contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="currentCost" name="Current Cost (without API)" fill="hsl(0, 72%, 51%)" barSize={14} radius={[0, 4, 4, 0]} fillOpacity={0.6} />
                <Bar dataKey="peerCostWithApi" name="Peer Cost (with API)" fill="hsl(152, 60%, 40%)" barSize={14} radius={[0, 4, 4, 0]} fillOpacity={0.6} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border card-shadow overflow-hidden">
            <div className="p-5 border-b"><h3 className="text-sm font-medium">Opportunity Cost Registry</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">Function</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Linked API</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Current Cost</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Peer Cost (with API)</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Potential Saving</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Peer Count</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Info</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {opcItems.sort((a, b) => b.potentialSaving - a.potentialSaving).map(o => {
                    const api = allApis.find(a => a.id === o.linkedApiId);
                    const isExpanded = expandedPeerItem === o.id;
                    return (
                      <>
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium">{o.functionName}</td>
                          <td className="p-3 text-muted-foreground text-xs">{api?.name || o.linkedApiId}</td>
                          <td className="p-3 font-mono text-xs">{o.yourCost} kSEK</td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{o.peerAverageCost} kSEK</td>
                          <td className="p-3">
                            {o.adopted ? (
                              <Badge className="text-xs bg-success/10 text-success border-success/30">Implemented</Badge>
                            ) : (
                              <Badge className="text-xs bg-success/10 text-success border-success/30">{o.potentialSaving} kSEK</Badge>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{o.peerCount} municipalities</td>
                          <td className="p-3">
                            {o.peerDetails.length > 0 && (
                              <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setExpandedPeerItem(isExpanded ? null : o.id)}>
                                <Info className="h-3 w-3" /> {isExpanded ? "Hide" : "Details"}
                              </button>
                            )}
                          </td>
                          <td className="p-3">
                            <Link to="/api" className="text-xs text-primary hover:underline">Review API →</Link>
                          </td>
                        </tr>
                        {isExpanded && o.peerDetails.length > 0 && (
                          <tr key={`${o.id}-details`}>
                            <td colSpan={8} className="p-0">
                              <div className="bg-muted/20 px-6 py-3 space-y-2">
                                <p className="text-xs font-medium text-foreground">Peer Municipality Breakdown</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {o.peerDetails.map((peer, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-card rounded p-2 border">
                                      <span className="text-muted-foreground">{peer.municipalityAlias}</span>
                                      <span className="font-mono font-medium">{peer.cost} kSEK</span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  Average: {o.peerAverageCost} kSEK (sum of {o.peerDetails.length} peer costs ÷ {o.peerDetails.length} = {Math.round(o.peerDetails.reduce((s, p) => s + p.cost, 0) / o.peerDetails.length)} kSEK)
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <p className="text-xs text-muted-foreground italic text-center">
            Estimates based on cross-municipal platform data. "Current Cost" = what you spend without the API. "Peer Cost" = what peers spend with the API implemented.
          </p>
        </div>
      )}
    </div>
  );
}
