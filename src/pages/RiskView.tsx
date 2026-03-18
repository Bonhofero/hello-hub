import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import LifecycleBar from "@/components/LifecycleBar";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Clock, Server, ShieldAlert, Info, TrendingUp, TrendingDown, Minus, ArrowRight, Link2, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  AreaChart, Area,
} from "recharts";
import {
  useSystems, useRisks, useApis, useOrganizations, useRiskScoreHistory,
  dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform, enrichSystems,
  computeLikelihood, computeImpact, getRiskScaleColor, getRiskScaleLabel,
  type PlatformRisk, type PlatformSystem,
} from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

function TrendIndicator({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return <Minus className="h-3 w-3 text-muted-foreground" />;
  if (current > previous) return <TrendingUp className="h-3 w-3 text-destructive" />;
  if (current < previous) return <TrendingDown className="h-3 w-3 text-success" />;
  return <ArrowRight className="h-3 w-3 text-muted-foreground" />;
}

function RiskScoreBar({ score }: { score: number }) {
  const color = getRiskScaleColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-px">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className="h-3 rounded-sm"
            style={{
              width: 2,
              backgroundColor: i < score ? color : "hsl(var(--muted))",
              opacity: i < score ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

function SmallScoreChart({ data, color }: { data: { label: string; score: number }[]; color: string }) {
  if (!data || data.length === 0) return <p className="text-xs text-muted-foreground">No trend data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={90}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fill-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis domain={[1, 25]} hide />
        <Area type="monotone" dataKey="score" stroke={color} fill={`url(#fill-${color.replace(/[^a-z0-9]/gi, "")})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RiskScoreHistoryChart({ riskId }: { riskId: string }) {
  const { data: history } = useRiskScoreHistory(riskId);
  const chartData = useMemo(() =>
    (history || []).map((h: any) => ({ label: new Date(h.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }), score: h.score })),
    [history]
  );
  const color = chartData.length > 0 ? getRiskScaleColor(chartData[chartData.length - 1].score) : "hsl(var(--muted-foreground))";
  return <SmallScoreChart data={chartData} color={color} />;
}

export default function RiskView() {
  const [searchParams] = useSearchParams();
  const highlightRisk = searchParams.get("risk");
  const filterSystem = searchParams.get("system");
  const [tab, setTab] = useState<"heatmap" | "riskcost" | "trends">("heatmap");
  const [infoOpen, setInfoOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const queryClient = useQueryClient();
  const { data: rawSystems } = useSystems();
  const { data: rawRisks, isLoading } = useRisks();
  const { data: rawApis } = useApis();
  const { data: rawOrgs } = useOrganizations();

  const allRisks = useMemo(() => (rawRisks || []).map(dbRiskToPlatform), [rawRisks]);
  const allApis = useMemo(() => (rawApis || []).map(dbApiToPlatform), [rawApis]);
  const systems = useMemo(() => enrichSystems((rawSystems || []).map(dbSystemToPlatform), allRisks, allApis), [rawSystems, allRisks, allApis]);

  // Risk appetite threshold from org
  const org = useMemo(() => (rawOrgs || [])[0], [rawOrgs]);
  const [threshold, setThreshold] = useState(16);
  useEffect(() => {
    if (org?.risk_appetite_threshold != null) setThreshold(org.risk_appetite_threshold);
  }, [org]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const persistThreshold = useCallback((val: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (org?.id) {
        await (supabase as any).from("organizations").update({ risk_appetite_threshold: val }).eq("id", org.id);
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
      }
    }, 500);
  }, [org, queryClient]);

  const [selectedRisk, setSelectedRisk] = useState<PlatformRisk | null>(
    highlightRisk ? allRisks.find(r => r.id === highlightRisk) || null : null
  );

  const displayedRisks = useMemo(() => {
    if (filterSystem) return allRisks.filter(r => r.linkedSystemId === filterSystem);
    return allRisks;
  }, [allRisks, filterSystem]);

  const getSystemById = (id: string) => systems.find(s => s.id === id);

  // Compute auto-scores — 1-25 scale
  const scoredRisks = useMemo(() => displayedRisks.map(r => {
    const sys = getSystemById(r.linkedSystemId);
    const lh = computeLikelihood(r, sys, allRisks);
    const imp = computeImpact(r, sys);
    const score25 = lh.score * imp.score;
    const level = getRiskScaleLabel(score25);
    return { ...r, autoLikelihood: lh.score, autoImpact: imp.score, lhSignals: lh.signals, impSignals: imp.signals, score: score25, level, previousScore: r.previousScore };
  }), [displayedRisks, systems, allRisks]);

  // Distribution on 1-25 scale
  const dist = { critical: 0, high: 0, medium: 0, low: 0 };
  scoredRisks.forEach(r => {
    if (r.score >= 19) dist.critical++;
    else if (r.score >= 13) dist.high++;
    else if (r.score >= 6) dist.medium++;
    else dist.low++;
  });

  // Compact heatmap: 5x5 grid
  const heatmapGrid = Array.from({ length: 5 }, (_, impact) =>
    Array.from({ length: 5 }, (_, likelihood) =>
      scoredRisks.filter(r => r.autoImpact === 5 - impact && r.autoLikelihood === likelihood + 1)
    )
  );

  const highRisks = scoredRisks.filter(r => r.score >= 13);
  const noReview12 = systems.filter(s => { const d = new Date(s.lastReviewDate); return s.lastReviewDate && (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) > 365; });
  const vulnSystems = displayedRisks.filter(r => r.type === "vulnerability");
  const spof = displayedRisks.filter(r => r.type === "single-point-of-failure");
  const risksAboveThreshold = scoredRisks.filter(r => r.score >= threshold);

  // Risk vs Cost scatter data
  const riskCostScatter = useMemo(() => {
    const sysMap = new Map<string, { name: string; maxScore: number; cost: number; riskCount: number; level: string }>();
    scoredRisks.forEach(r => {
      const sys = getSystemById(r.linkedSystemId);
      if (!sys) return;
      const existing = sysMap.get(sys.id);
      if (!existing) {
        sysMap.set(sys.id, { name: sys.name, maxScore: r.score, cost: sys.annualCost, riskCount: 1, level: r.level });
      } else {
        existing.riskCount++;
        if (r.score > existing.maxScore) { existing.maxScore = r.score; existing.level = r.level; }
      }
    });
    return Array.from(sysMap.values());
  }, [scoredRisks, systems]);

  // Linked risks for dependency mapping
  const selectedLinkedRiskIds = selectedRisk?.linkedRiskIds || [];

  // Save linked risks
  const saveLinkedRisks = async (riskId: string, linkedIds: string[]) => {
    await (supabase as any).from("risks").update({ linked_risk_ids: linkedIds.join(",") }).eq("id", riskId);
    queryClient.invalidateQueries({ queryKey: ["risks"] });
  };

  // Save linked dependency text
  const saveDependencyText = async (riskId: string, text: string) => {
    await (supabase as any).from("risks").update({ linked_dependency: text }).eq("id", riskId);
    queryClient.invalidateQueries({ queryKey: ["risks"] });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading risks…</p></div>;

  if (displayedRisks.length === 0 && !filterSystem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">No Risks Registered</h2>
        <p className="text-sm text-muted-foreground max-w-md">Run the seed-demo function to populate risk data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Risk Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Risk severity on a 1–25 scale. Scores computed from system data.
          {filterSystem && (() => { const s = getSystemById(filterSystem); return s ? ` — filtered to ${s.name}` : ""; })()}
        </p>
        {filterSystem && <Link to="/risk" className="text-xs text-primary hover:underline">← Clear filter · Show all risks</Link>}
      </div>

      {/* Appetite threshold banner */}
      {!bannerDismissed && risksAboveThreshold.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
          <p className="text-sm font-medium text-warning">⚠ {risksAboveThreshold.length} risk{risksAboveThreshold.length !== 1 ? "s" : ""} exceed your appetite threshold.</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setTab("trends")}>View</Button>
            <button onClick={() => setBannerDismissed(true)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        </div>
      )}

      {/* Info panel */}
      <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-xs text-primary hover:underline">
            <Info className="h-3.5 w-3.5" /> {infoOpen ? "Hide" : "Show"} scoring methodology
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground space-y-3">
            <div>
              <p className="font-medium text-foreground mb-1">1–25 Risk Scale</p>
              <p>Score 1–25 (Likelihood 1–5 × Impact 1–5). Low: 1–5 · Medium: 6–12 · High: 13–18 · Critical: 19–25.</p>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getRiskScaleColor(3) }} /> 1–5: Low</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getRiskScaleColor(9) }} /> 6–12: Medium</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getRiskScaleColor(15) }} /> 13–18: High</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getRiskScaleColor(20) }} /> 19–25: Critical</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Distribution bar */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskScaleColor(20) }} /> Critical (19–25): {dist.critical}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskScaleColor(15) }} /> High (13–18): {dist.high}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskScaleColor(9) }} /> Medium (6–12): {dist.medium}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskScaleColor(3) }} /> Low (1–5): {dist.low}</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {(["heatmap", "riskcost", "trends"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "heatmap" ? "Risk Heatmap" : t === "riskcost" ? "Risk vs. Cost" : "Trends"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="High/Critical Risks" value={String(highRisks.length)} change="Score ≥ 13" changeType="negative" icon={AlertTriangle} />
        <StatCard title="No Review (12m)" value={String(noReview12.length)} change="Systems without recent review" changeType={noReview12.length > 0 ? "negative" : "positive"} icon={Clock} />
        <StatCard title="Unpatched Vulnerabilities" value={String(vulnSystems.length)} change={`${vulnSystems.length} system(s) affected`} changeType={vulnSystems.length > 0 ? "negative" : "positive"} icon={Shield} />
        <StatCard title="Single Points of Failure" value={String(spof.length)} change="No redundancy" changeType={spof.length > 0 ? "negative" : "positive"} icon={Server} />
        <StatCard title="Board-Visible" value={String(displayedRisks.filter(r => r.boardVisibility).length)} change="Escalated to leadership" changeType="neutral" icon={ShieldAlert} />
      </div>

      {tab === "heatmap" && (
        <>
          {/* Threshold slider */}
          <div className="space-y-1">
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Risk Appetite Threshold</span>
              <Slider min={1} max={25} step={1} value={[threshold]} onValueChange={v => { setThreshold(v[0]); persistThreshold(v[0]); }} className="flex-1 max-w-[200px]" />
              <Badge style={{ backgroundColor: `${getRiskScaleColor(threshold)}20`, color: getRiskScaleColor(threshold) }} className="text-xs font-mono">{threshold}</Badge>
            </div>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button className="text-xs text-primary hover:underline">What is this?</button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/50 rounded-lg p-3 mt-1 space-y-1.5">
                  <p className="text-xs font-medium text-foreground">Risk Appetite Threshold</p>
                  <p className="text-xs text-muted-foreground">Your risk appetite threshold defines the maximum level of risk your organisation is willing to accept without taking action. Risks scoring at or above this threshold are treated as requiring immediate intervention.</p>
                  <p className="text-xs text-muted-foreground">On the heatmap, cells above the threshold are marked 'Requires Action'. Any risk in those cells will trigger a banner alert and should be assigned an owner and mitigation plan.</p>
                  <p className="text-xs text-muted-foreground">The default threshold of 16 (out of 25) reflects a common public-sector standard — equivalent to high likelihood and high impact. Adjust it to reflect your municipality's current risk tolerance.</p>
                  <CollapsibleTrigger asChild>
                    <button className="text-xs text-primary hover:underline ml-auto block">Hide</button>
                  </CollapsibleTrigger>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Compact heatmap */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-4 card-shadow">
              <h3 className="text-sm font-medium mb-1">Risk Heatmap</h3>
              <p className="text-[10px] text-muted-foreground mb-3">Impact ↑ × Likelihood →</p>
              <div className="flex gap-2">
                <div className="flex flex-col items-center justify-between py-0.5">
                  {[5, 4, 3, 2, 1].map(n => <span key={n} className="text-[9px] text-muted-foreground font-mono leading-none h-8 flex items-center">{n}</span>)}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-5 gap-1">
                    {heatmapGrid.map((row, ri) => row.map((items, ci) => {
                      const impact = 5 - ri;
                      const likelihood = ci + 1;
                      const cellScore = impact * likelihood;
                      const cellColor = getRiskScaleColor(cellScore);
                      const isAbove = cellScore >= threshold;
                      const isLinked = selectedRisk && items.length === 0 && scoredRisks.some(sr => selectedRisk.linkedRiskIds.includes(sr.id) && sr.autoImpact === impact && sr.autoLikelihood === likelihood);
                      return (
                        <div key={`${ri}-${ci}`}
                          className={`h-8 rounded flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105`}
                          style={{
                            backgroundColor: items.length > 0 ? `${cellColor}30` : isAbove ? "hsl(0, 72%, 51%, 0.05)" : "hsl(152, 60%, 40%, 0.03)",
                            border: items.length > 0 ? `1.5px solid ${cellColor}` : isAbove ? "1px dashed hsl(0, 72%, 51%, 0.3)" : "1px solid hsl(var(--border))",
                            boxShadow: isLinked ? `0 0 0 2px ${cellColor}, 0 0 6px ${cellColor}40` : undefined,
                          }}
                          onClick={() => items.length > 0 && setSelectedRisk(items[0])}
                          title={`I:${impact} × L:${likelihood} = ${cellScore}/25 — ${items.length} risk(s)`}
                        >
                          {items.length > 0 && (
                            <span className="text-xs font-bold" style={{ color: cellColor }}>{items.length}</span>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1, 2, 3, 4, 5].map(n => <span key={n} className="text-[9px] text-muted-foreground font-mono">{n}</span>)}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                    <span className="text-success">Acceptable</span>
                    <span className="text-destructive">Requires Action</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: getRiskScaleColor(3) }} />Low</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: getRiskScaleColor(9) }} />Medium</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: getRiskScaleColor(15) }} />High</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: getRiskScaleColor(20) }} />Critical</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border p-5 card-shadow">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> High/Critical Risk List (≥13)</h3>
              {highRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No high-severity risks.</p>
              ) : (
                <div className="space-y-2">
                  {highRisks.map(r => {
                    const sys = getSystemById(r.linkedSystemId);
                    return (
                      <div key={r.id} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors" onClick={() => setSelectedRisk(r)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="mt-1 h-2 w-2 rounded-full bg-destructive animate-pulse-slow shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{sys?.name}</p>
                            </div>
                          </div>
                          <RiskScoreBar score={r.score} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Risk Register Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border card-shadow overflow-hidden">
            <div className="p-5 border-b"><h3 className="text-sm font-medium">Risk Register</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">Risk</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">System</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Lifecycle</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Severity</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Trend</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Owner</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Due</th>
                     <th className="text-left p-3 font-medium text-muted-foreground">Escalation</th>
                  </tr>
                </thead>
                <tbody>
                  {scoredRisks.sort((a, b) => b.score - a.score).map(r => {
                    const sys = getSystemById(r.linkedSystemId);
                    return (
                      <TooltipProvider key={r.id}>
                        <tr className={`border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${highlightRisk === r.id ? "bg-primary/5" : ""}`} onClick={() => setSelectedRisk(r)}>
                          <td className="p-3"><p className="font-medium">{r.title}</p></td>
                          <td className="p-3 text-muted-foreground text-xs">{r.type}</td>
                          <td className="p-3"><Link to={`/system-map?system=${r.linkedSystemId}`} className="text-primary text-xs hover:underline" onClick={e => e.stopPropagation()}>{sys?.name}</Link></td>
                          <td className="p-3">{sys?.lifecycle ? <LifecycleBar lifecycle={sys.lifecycle} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                          <td className="p-3"><RiskScoreBar score={r.score} /></td>
                          <td className="p-3"><TrendIndicator current={r.score} previous={r.previousScore} /></td>
                          <td className="p-3 text-muted-foreground text-xs">{r.owner}</td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{r.dueDate}</td>
                          <td className="p-3">{r.boardVisibility ? <Badge className="text-[10px] bg-warning/10 text-warning border-warning/20">Board</Badge> : r.escalationStatus !== "none" ? <Badge variant="secondary" className="text-[10px]">{r.escalationStatus}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</td>
                        </tr>
                      </TooltipProvider>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {tab === "riskcost" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-5 card-shadow">
          <h3 className="text-sm font-medium mb-1">Risk vs. Cost Concentration</h3>
          <p className="text-xs text-muted-foreground mb-4">X = risk severity (1-25), Y = annual cost (kSEK), dot size = open risk count</p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="maxScore" name="Risk Severity" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Risk Severity (1-25)", position: "bottom", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 25]} />
              <YAxis type="number" dataKey="cost" name="Cost (kSEK)" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Annual Cost (kSEK)", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <ZAxis type="number" dataKey="riskCount" range={[60, 300]} />
              <ReferenceLine x={threshold} stroke="hsl(38, 92%, 50%)" strokeDasharray="6 4" label={{ value: "Appetite Threshold", position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <ReferenceLine y={3000} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-card border rounded-lg p-2.5 text-xs shadow-md">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-muted-foreground">Severity: {d.maxScore}/25 · Cost: {d.cost.toLocaleString()} kSEK · Risks: {d.riskCount}</p>
                  </div>
                );
              }} />
              <Scatter data={riskCostScatter}>
                {riskCostScatter.map((entry, i) => (
                  <Cell key={i} fill={getRiskScaleColor(entry.maxScore)} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground text-right mt-2 italic">Top-right quadrant: High Cost / High Risk — Priority for action</p>
        </motion.div>
      )}

      {tab === "trends" && (
        <div className="space-y-4">
          {scoredRisks.sort((a, b) => b.score - a.score).map(r => {
            const sys = getSystemById(r.linkedSystemId);
            const color = getRiskScaleColor(r.score);
            const hasLinks = r.linkedRiskIds.length > 0;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-4 card-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{r.title}</p>
                        {hasLinks && (
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger><Link2 className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Linked: {r.linkedRiskIds.map(lid => allRisks.find(ar => ar.id === lid)?.title || lid).join(", ")}</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{sys?.name || "—"}</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: `${color}20`, color }} className="text-xs font-mono shrink-0">{r.score}/25 · {r.level}</Badge>
                </div>
                <RiskScoreHistoryChart riskId={r.id} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Risk Detail Drawer */}
      <Sheet open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedRisk && (() => {
            const sys = getSystemById(selectedRisk.linkedSystemId);
            const scored = scoredRisks.find(r => r.id === selectedRisk.id);
            const s25 = scored?.score || 0;
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedRisk.title}</SheetTitle>
                  <SheetDescription>{selectedRisk.id} · {selectedRisk.type}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Risk Severity</p>
                      <div className="mt-1">
                        <RiskScoreBar score={s25} />
                        <p className="text-xs text-muted-foreground mt-1">{getRiskScaleLabel(s25)} ({scored?.autoImpact}×{scored?.autoLikelihood}={s25}/25)</p>
                      </div>
                    </div>
                    <div><p className="text-muted-foreground">Owner</p><p className="font-medium">{selectedRisk.owner}</p></div>
                    <div><p className="text-muted-foreground">Linked System</p>{sys ? <Link to={`/system-map?system=${selectedRisk.linkedSystemId}`} className="text-primary hover:underline font-medium">{sys.name}</Link> : <p>—</p>}{sys?.lifecycle && <div className="mt-1"><LifecycleBar lifecycle={sys.lifecycle} /></div>}</div>
                    <div><p className="text-muted-foreground">Due Date</p><p className="font-medium font-mono">{selectedRisk.dueDate}</p></div>
                    <div><p className="text-muted-foreground">Escalation</p><p className="font-medium">{selectedRisk.escalationStatus}{selectedRisk.boardVisibility ? " (Board visible)" : ""}</p></div>
                    <div><p className="text-muted-foreground">Trend</p><div className="flex items-center gap-1"><TrendIndicator current={s25} previous={selectedRisk.previousScore} /><span className="text-xs">{selectedRisk.previousScore !== undefined ? `was ${selectedRisk.previousScore}` : "no history"}</span></div></div>
                  </div>
                  {scored && (
                    <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                      <div><p className="font-medium text-foreground">Likelihood signals</p><ul className="list-disc pl-4 text-muted-foreground">{scored.lhSignals.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                      <div><p className="font-medium text-foreground">Impact signals</p><ul className="list-disc pl-4 text-muted-foreground">{scored.impSignals.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                    </div>
                  )}
                  <div><p className="font-semibold text-foreground mb-1">Mitigation</p><p className="text-muted-foreground">{selectedRisk.mitigation}</p></div>
                  <div><p className="font-semibold text-foreground mb-1">Affected Services</p><div className="flex flex-wrap gap-1">{selectedRisk.affectedServices.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></div>

                  {/* Linked Risks */}
                  <div>
                    <p className="font-semibold text-foreground mb-2">Linked Risks</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedRisk.linkedRiskIds.map(lid => {
                        const lr = allRisks.find(r => r.id === lid);
                        const ls = lr ? scoredRisks.find(s => s.id === lid) : null;
                        return lr ? (
                          <Badge key={lid} variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => setSelectedRisk(lr)}>
                            {lr.title} {ls && <span className="ml-1 font-mono" style={{ color: getRiskScaleColor(ls.score) }}>{ls.score}</span>}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">Add linked risk</Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-64" align="start">
                        <Command>
                          <CommandInput placeholder="Search risks..." />
                          <CommandList>
                            <CommandEmpty>No risks found.</CommandEmpty>
                            {allRisks.filter(r => r.id !== selectedRisk.id && !selectedRisk.linkedRiskIds.includes(r.id)).map(r => (
                              <CommandItem key={r.id} onSelect={() => {
                                const newIds = [...selectedRisk.linkedRiskIds, r.id];
                                setSelectedRisk({ ...selectedRisk, linkedRiskIds: newIds });
                                saveLinkedRisks(selectedRisk.id, newIds);
                              }}>
                                {r.title}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Dependency description</p>
                      <Textarea
                        defaultValue={selectedRisk.linkedDependency || ""}
                        placeholder="Describe the dependency relationship..."
                        className="text-xs"
                        rows={2}
                        onBlur={e => saveDependencyText(selectedRisk.id, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Score History */}
                  <div>
                    <p className="font-semibold text-foreground mb-2">Score History</p>
                    <RiskScoreHistoryChart riskId={selectedRisk.id} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {sys && <Link to={`/system-map?system=${selectedRisk.linkedSystemId}`}><Button variant="outline" size="sm" className="text-xs gap-1">View System</Button></Link>}
                    <Link to="/governance"><Button variant="outline" size="sm" className="text-xs gap-1">Governance</Button></Link>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
