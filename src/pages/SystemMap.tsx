import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Map, List, ShieldAlert, ScrollText, Layers, ExternalLink, ArrowRight, RotateCcw } from "lucide-react";
import {
  useSystems, useRisks, useApis, useGovernanceDocs,
  dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform, dbGovDocToPlatform,
  enrichSystems, lifecycleColors, criticalityColors,
  type PlatformSystem
} from "@/hooks/useDatabase";
import { alternatives } from "@/pages/ApiManagement";
import systemMapBg from "@/assets/system-map-bg.png";

type ViewMode = "operational" | "risk" | "standards";

const statusLabels: Record<string, string> = {
  active: "Active", legacy: "Legacy", encapsulated: "Encapsulated",
  "review-needed": "Review Needed", "end-of-life": "End of Life", decommissioning: "Decommissioning",
};

const effortLabels: Record<string, string> = { low: "Low effort", medium: "Medium effort", high: "High effort" };

function getNodeColor(system: PlatformSystem, mode: ViewMode, risks: any[]): string {
  if (mode === "risk") {
    const sysRisks = risks.filter(r => r.linkedSystemId === system.id);
    if (sysRisks.some(r => r.impact * r.likelihood >= 16)) return "hsl(0, 72%, 51%)";
    if (sysRisks.some(r => r.impact * r.likelihood >= 9)) return "hsl(38, 92%, 50%)";
    if (sysRisks.length > 0) return "hsl(199, 89%, 48%)";
    return "hsl(152, 60%, 40%)";
  }
  if (mode === "standards") {
    if (system.standardsUsed.length === 0) return "hsl(38, 92%, 50%)";
    return "hsl(152, 60%, 40%)";
  }
  return lifecycleColors[system.lifecycle] || "hsl(215, 14%, 46%)";
}

// Different connection logic per mode
function getConnections(system: PlatformSystem, mode: ViewMode, allSystems: PlatformSystem[], allRisks: any[], allApis: any[], govDocs: any[]) {
  if (mode === "operational") {
    // Show dependency connections
    return system.dependencies
      .map(depId => allSystems.find(s => s.id === depId))
      .filter(Boolean)
      .map(dep => ({
        targetId: dep!.id,
        targetX: dep!.x,
        targetY: dep!.y,
        color: system.linkedApis.length > 0 ? "hsl(199, 89%, 70%)" : "hsl(214, 20%, 85%)",
        strokeWidth: system.linkedApis.length > 0 ? 2 : 1.5,
        dashed: system.linkedApis.length === 0,
      }));
  }
  if (mode === "risk") {
    // Connect systems that share risks through linked_dependency
    const sysRisks = allRisks.filter(r => r.linkedSystemId === system.id);
    const connections: any[] = [];
    sysRisks.forEach(r => {
      if (r.linkedDependency) {
        const dep = allSystems.find(s => s.id === r.linkedDependency);
        if (dep && !connections.find(c => c.targetId === dep.id)) {
          const score = r.impact * r.likelihood;
          connections.push({
            targetId: dep.id,
            targetX: dep.x,
            targetY: dep.y,
            color: score >= 16 ? "hsl(0, 72%, 60%)" : score >= 9 ? "hsl(38, 92%, 60%)" : "hsl(199, 89%, 70%)",
            strokeWidth: score >= 16 ? 2.5 : 2,
            dashed: false,
          });
        }
      }
    });
    // Also connect systems with shared risk owners
    return connections;
  }
  if (mode === "standards") {
    // Connect systems that share the same standards
    const connections: any[] = [];
    system.standardsUsed.forEach(std => {
      allSystems.forEach(other => {
        if (other.id !== system.id && other.standardsUsed.includes(std) && !connections.find(c => c.targetId === other.id)) {
          connections.push({
            targetId: other.id,
            targetX: other.x,
            targetY: other.y,
            color: "hsl(262, 52%, 65%)",
            strokeWidth: 1.5,
            dashed: true,
          });
        }
      });
    });
    // Connect systems sharing governance docs
    system.linkedGovDocs.forEach(docId => {
      allSystems.forEach(other => {
        if (other.id !== system.id && other.linkedGovDocs.includes(docId) && !connections.find(c => c.targetId === other.id)) {
          connections.push({
            targetId: other.id,
            targetX: other.x,
            targetY: other.y,
            color: "hsl(168, 60%, 50%)",
            strokeWidth: 1.5,
            dashed: false,
          });
        }
      });
    });
    return connections;
  }
  return [];
}

export default function SystemMap() {
  const [searchParams] = useSearchParams();
  const highlightSystem = searchParams.get("system");

  const { data: rawSystems, isLoading } = useSystems();
  const { data: rawRisks } = useRisks();
  const { data: rawApis } = useApis();
  const { data: rawDocs } = useGovernanceDocs();

  const allRisks = useMemo(() => (rawRisks || []).map(dbRiskToPlatform), [rawRisks]);
  const allApis = useMemo(() => (rawApis || []).map(dbApiToPlatform), [rawApis]);
  const allSystems = useMemo(() => enrichSystems((rawSystems || []).map(dbSystemToPlatform), allRisks, allApis), [rawSystems, allRisks, allApis]);
  const govDocs = useMemo(() => (rawDocs || []).map(dbGovDocToPlatform), [rawDocs]);

  const [viewMode, setViewMode] = useState<ViewMode>("operational");
  const [viewType, setViewType] = useState<"map" | "table">("map");
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [selectedSystem, setSelectedSystem] = useState<PlatformSystem | null>(
    highlightSystem ? allSystems.find(s => s.id === highlightSystem) || null : null
  );

  const filtered = useMemo(() => {
    let systems = [...allSystems];
    if (search) {
      const q = search.toLowerCase();
      systems = systems.filter(s => s.name.toLowerCase().includes(q) || s.vendor.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q));
    }
    if (lifecycleFilter !== "all") systems = systems.filter(s => s.lifecycle === lifecycleFilter);
    if (criticalityFilter !== "all") systems = systems.filter(s => s.criticality === criticalityFilter);
    return systems;
  }, [allSystems, search, lifecycleFilter, criticalityFilter]);

  // Get API solutions for a system from the databank
  const getApiSolutions = (system: PlatformSystem) => {
    if (system.lifecycle !== "legacy" && system.lifecycle !== "end-of-life" && system.lockInRisk !== "high" && system.lockInRisk !== "medium") return [];
    return alternatives.filter(a => a.systemId === system.id).slice(0, 3);
  };

  // Mode-specific legend
  const modeLegend: { label: string; color: string; type?: "line" }[] = useMemo(() => {
    if (viewMode === "operational") return [
      { label: "Active", color: lifecycleColors.active },
      { label: "Legacy", color: lifecycleColors.legacy },
      { label: "Review Needed", color: lifecycleColors["review-needed"] },
      { label: "API-linked", color: "hsl(199, 89%, 70%)", type: "line" as const },
    ];
    if (viewMode === "risk") return [
      { label: "Critical risk", color: "hsl(0, 72%, 51%)" },
      { label: "High risk", color: "hsl(38, 92%, 50%)" },
      { label: "Some risk", color: "hsl(199, 89%, 48%)" },
      { label: "No risk", color: "hsl(152, 60%, 40%)" },
      { label: "Risk dependency", color: "hsl(0, 72%, 60%)", type: "line" as const },
    ];
    return [
      { label: "Has standards", color: "hsl(152, 60%, 40%)" },
      { label: "No standards", color: "hsl(38, 92%, 50%)" },
      { label: "Shared standard", color: "hsl(262, 52%, 65%)", type: "line" as const },
      { label: "Shared gov doc", color: "hsl(168, 60%, 50%)", type: "line" as const },
    ];
  }, [viewMode]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading systems…</p></div>;

  if (allSystems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">No Systems Registered</h2>
        <p className="text-sm text-muted-foreground max-w-md">Run the seed-demo function to populate system data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {viewMode === "operational" && "Dependencies and API connections"}
            {viewMode === "risk" && "Risk dependencies between systems"}
            {viewMode === "standards" && "Standards and governance document connections"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={v => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="operational" className="text-xs gap-1"><Layers className="h-3.5 w-3.5" /> Operational</ToggleGroupItem>
            <ToggleGroupItem value="risk" className="text-xs gap-1"><ShieldAlert className="h-3.5 w-3.5" /> Risk</ToggleGroupItem>
            <ToggleGroupItem value="standards" className="text-xs gap-1"><ScrollText className="h-3.5 w-3.5" /> Standards</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={viewType} onValueChange={v => v && setViewType(v as "map" | "table")}>
            <ToggleGroupItem value="map" className="text-xs gap-1"><Map className="h-3.5 w-3.5" /> Map</ToggleGroupItem>
            <ToggleGroupItem value="table" className="text-xs gap-1"><List className="h-3.5 w-3.5" /> Table</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search systems, vendors, owners..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Lifecycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lifecycles</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Criticality" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        {(search || lifecycleFilter !== "all" || criticalityFilter !== "all") && (
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => { setSearch(""); setLifecycleFilter("all"); setCriticalityFilter("all"); }}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
        {modeLegend.map(item => (
          <span key={item.label} className="flex items-center gap-1">
            {item.type === "line" ? (
              <span className="w-4 h-0 border-t-2" style={{ borderColor: item.color }} />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            )}
            {item.label}
          </span>
        ))}
      </div>

      {viewType === "map" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border card-shadow relative overflow-hidden" style={{ height: 560 }}>
          <img src={systemMapBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" />
          <svg width="100%" height="100%" className="absolute inset-0">
            {filtered.map(system => {
              const connections = getConnections(system, viewMode, allSystems, allRisks, allApis, govDocs);
              return connections.map((conn, ci) => {
                const dep = allSystems.find(s => s.id === conn.targetId);
                if (!dep || !filtered.includes(dep)) return null;
                return (
                  <line key={`${system.id}-${conn.targetId}-${ci}`}
                    x1={system.x + 70} y1={system.y + 30} x2={conn.targetX + 70} y2={conn.targetY + 30}
                    stroke={conn.color}
                    strokeWidth={conn.strokeWidth}
                    strokeDasharray={conn.dashed ? "4 4" : "0"}
                  />
                );
              });
            })}
          </svg>
          {filtered.map((system, i) => {
            const nodeColor = getNodeColor(system, viewMode, allRisks);
            const isHighlighted = highlightSystem === system.id;
            return (
              <motion.div key={system.id}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: isHighlighted ? 1.08 : 1 }}
                transition={{ delay: i * 0.03 }}
                className={`absolute bg-card border rounded-lg p-3 card-shadow hover:card-shadow-hover transition-all cursor-pointer group ${isHighlighted ? "ring-2 ring-primary" : ""}`}
                style={{ left: system.x, top: system.y, width: 155, borderLeftWidth: 3, borderLeftColor: nodeColor }}
                onClick={() => setSelectedSystem(system)}
              >
                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{system.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{system.vendor}</p>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: nodeColor }} />
                  <span className="text-[10px] text-muted-foreground">
                    {viewMode === "operational" && (statusLabels[system.lifecycle] || system.lifecycle)}
                    {viewMode === "risk" && `${allRisks.filter(r => r.linkedSystemId === system.id).length} risks`}
                    {viewMode === "standards" && `${system.standardsUsed.length} std`}
                  </span>
                  {system.openRisks.length > 0 && viewMode !== "risk" && <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-destructive/10 text-destructive">{system.openRisks.length}R</Badge>}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {viewType === "table" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-3 font-medium text-muted-foreground">System</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Domain</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Lifecycle</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Criticality</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Risks</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">APIs</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cost (kSEK)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedSystem(s)}>
                    <td className="p-3"><p className="font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.vendor}</p></td>
                    <td className="p-3 text-muted-foreground">{s.owner}</td>
                    <td className="p-3 text-muted-foreground text-xs">{s.domain}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${lifecycleColors[s.lifecycle]}20`, color: lifecycleColors[s.lifecycle] }}>{statusLabels[s.lifecycle]}</Badge></td>
                    <td className="p-3"><Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${criticalityColors[s.criticality]}20`, color: criticalityColors[s.criticality] }}>{s.criticality}</Badge></td>
                    <td className="p-3">{s.openRisks.length > 0 ? <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">{s.openRisks.length}</Badge> : <span className="text-muted-foreground">0</span>}</td>
                    <td className="p-3 text-muted-foreground">{s.linkedApis.length}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{s.annualCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Sheet open={!!selectedSystem} onOpenChange={() => setSelectedSystem(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSystem && (() => {
            const apiSolutions = getApiSolutions(selectedSystem);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedSystem.name}</SheetTitle>
                  <SheetDescription>{selectedSystem.id} · {selectedSystem.vendor} · {selectedSystem.type}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-5 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-muted-foreground">Owner</p><p className="font-medium">{selectedSystem.owner}</p><p className="text-xs text-muted-foreground">{selectedSystem.ownerTitle}</p></div>
                    <div><p className="text-muted-foreground">Department</p><p className="font-medium">{selectedSystem.department}</p></div>
                    <div><p className="text-muted-foreground">Lifecycle</p><Badge variant="secondary" style={{ backgroundColor: `${lifecycleColors[selectedSystem.lifecycle]}20`, color: lifecycleColors[selectedSystem.lifecycle] }}>{statusLabels[selectedSystem.lifecycle]}</Badge></div>
                    <div><p className="text-muted-foreground">Criticality</p><Badge variant="secondary" style={{ backgroundColor: `${criticalityColors[selectedSystem.criticality]}20`, color: criticalityColors[selectedSystem.criticality] }}>{selectedSystem.criticality}</Badge></div>
                    <div><p className="text-muted-foreground">Annual Cost</p><p className="font-medium font-mono">{selectedSystem.annualCost.toLocaleString()} kSEK</p></div>
                    <div><p className="text-muted-foreground">Contract End</p><p className="font-medium font-mono">{selectedSystem.contractEnd}</p></div>
                    <div><p className="text-muted-foreground">Internet-facing</p><p className="font-medium">{selectedSystem.internetFacing ? "Yes" : "No"}</p></div>
                  </div>
                  <p className="text-muted-foreground">{selectedSystem.description}</p>
                  {selectedSystem.standardsUsed.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-2">Standards Used</p>
                      <div className="flex flex-wrap gap-1">{selectedSystem.standardsUsed.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
                    </div>
                  )}
                  {selectedSystem.openRisks.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-2">Active Risks</p>
                      {allRisks.filter(r => r.linkedSystemId === selectedSystem.id).map(r => (
                        <Link key={r.id} to={`/risk?risk=${r.id}`} className="flex items-start gap-2 p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 mb-1.5 hover:bg-destructive/10 transition-colors">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive shrink-0" />
                          <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.type} · I:{r.impact} × L:{r.likelihood}</p></div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {selectedSystem.linkedApis.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-2">Linked APIs</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSystem.linkedApis.map(apiId => {
                          const api = allApis.find(a => a.id === apiId);
                          return api ? <Link key={apiId} to={`/api?api=${apiId}`}><Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">{api.name} ({api.type})</Badge></Link> : null;
                        })}
                      </div>
                    </div>
                  )}
                  {selectedSystem.linkedGovDocs.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-2">Governance Documents</p>
                      <div className="space-y-1">{selectedSystem.linkedGovDocs.map(docId => {
                        const doc = govDocs.find(d => d.id === docId);
                        return doc ? (
                          <Link key={docId} to="/governance" className="flex items-center gap-2 p-2 rounded-lg border hover:bg-secondary transition-colors">
                            <ScrollText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0"><p className="text-xs font-medium truncate">{doc.title}</p><p className="text-[10px] text-muted-foreground">{doc.id} · {doc.owner || "No owner"}</p></div>
                          </Link>
                        ) : null;
                      })}</div>
                    </div>
                  )}
                  {/* Vendor Lock-in & Inline API Solutions */}
                  {selectedSystem.lockInRisk && selectedSystem.lockInRisk !== "none" && (
                    <div>
                      <p className="font-semibold text-foreground mb-2">Vendor Lock-in</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs" style={{
                          backgroundColor: selectedSystem.lockInRisk === "high" ? "hsl(0, 72%, 51%, 0.1)" : selectedSystem.lockInRisk === "medium" ? "hsl(38, 92%, 50%, 0.1)" : "hsl(152, 60%, 40%, 0.1)",
                          color: selectedSystem.lockInRisk === "high" ? "hsl(0, 72%, 51%)" : selectedSystem.lockInRisk === "medium" ? "hsl(38, 92%, 50%)" : "hsl(152, 60%, 40%)",
                        }}>
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          {selectedSystem.lockInRisk} risk
                        </Badge>
                        <span className="text-xs text-muted-foreground">API Reuse: {selectedSystem.apiReusePotential}</span>
                      </div>
                      {apiSolutions.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Recommended API Solutions</p>
                          {apiSolutions.map((alt, i) => (
                            <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium text-foreground">{alt.alternative}</h4>
                                  <Badge variant="secondary" className="text-[10px]">{alt.type}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{effortLabels[alt.effort]}</Badge>
                                </div>
                                <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              <p className="text-xs text-muted-foreground">{alt.description}</p>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <span>{alt.currentVendor}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span className="text-primary font-medium">{alt.alternative}</span>
                              </div>
                            </div>
                          ))}
                          <Link to="/api" className="flex items-center gap-1.5 text-xs text-primary hover:underline pt-1">
                            <Layers className="h-3 w-3" /> View full database →
                          </Link>
                        </div>
                      ) : (
                        <Link to="/api" className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-sm">
                          <Layers className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-primary">View API Database</p>
                            <p className="text-xs text-muted-foreground">Find APIs and tools to reduce vendor dependency</p>
                          </div>
                          <ExternalLink className="h-3 w-3 text-primary ml-auto shrink-0" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
