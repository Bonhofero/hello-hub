import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, KeyRound, Globe, Search, ExternalLink, ShieldAlert, Layers, ArrowRight, RotateCcw, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useApis, useSystems,
  dbApiToPlatform, dbSystemToPlatform,
  type PlatformApi
} from "@/hooks/useDatabase";

const familyConfig = {
  internal: { title: "Internal APIs", desc: "Used by departments and internal systems", badge: "Restricted", icon: Lock, color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.08)" },
  partner: { title: "Partner APIs", desc: "Shared with verified partners and municipalities", badge: "Key-based", icon: KeyRound, color: "hsl(38, 92%, 50%)", bg: "hsl(38, 92%, 50%, 0.08)" },
  public: { title: "Public APIs", desc: "Open data endpoints for citizens and developers", badge: "Open", icon: Globe, color: "hsl(152, 60%, 40%)", bg: "hsl(152, 60%, 40%, 0.08)" },
};

export interface Alternative {
  systemId: string;
  currentVendor: string;
  alternative: string;
  type: "open-source" | "open-standard" | "api-decoupling";
  description: string;
  url: string;
  apisToDecouple: string[];
  effort: "low" | "medium" | "high";
}

export const alternatives: Alternative[] = [
  { systemId: "SYS-002", currentVendor: "Microsoft (Active Directory)", alternative: "Keycloak", type: "open-source", description: "Open-source identity and access management. Supports SAML, OAuth2, OIDC. Drop-in replacement for AD-based SSO.", url: "https://www.keycloak.org", apisToDecouple: ["API-002"], effort: "high" },
  { systemId: "SYS-002", currentVendor: "Microsoft (Active Directory)", alternative: "Authentik", type: "open-source", description: "Modern open-source IdP with flow-based configuration, MFA, and LDAP bridge.", url: "https://goauthentik.io", apisToDecouple: ["API-002"], effort: "medium" },
  { systemId: "SYS-003", currentVendor: "CGI (Procapita)", alternative: "Open ePlatform Case Engine", type: "open-source", description: "Swedish open-source case management built for municipalities. REST API native.", url: "https://www.oeplatform.org", apisToDecouple: ["API-003"], effort: "high" },
  { systemId: "SYS-003", currentVendor: "CGI (Procapita)", alternative: "Camunda BPM", type: "open-source", description: "Open-source workflow and decision automation. Can orchestrate case processes with standard BPMN.", url: "https://camunda.com", apisToDecouple: ["API-003"], effort: "medium" },
  { systemId: "SYS-004", currentVendor: "Visma (HR+)", alternative: "Odoo HR", type: "open-source", description: "Full HR suite including payroll, leave, attendance. Modular and API-first.", url: "https://www.odoo.com", apisToDecouple: ["API-010"], effort: "high" },
  { systemId: "SYS-004", currentVendor: "Visma (HR+)", alternative: "ERPNext HRMS", type: "open-source", description: "Open-source HR and payroll module with Swedish tax compliance via extensions.", url: "https://erpnext.com", apisToDecouple: ["API-010"], effort: "high" },
  { systemId: "SYS-005", currentVendor: "Microsoft (SQL Server)", alternative: "PostgreSQL", type: "open-source", description: "World's most advanced open-source relational database. Feature-parity with SQL Server for most workloads.", url: "https://www.postgresql.org", apisToDecouple: ["API-004"], effort: "high" },
  { systemId: "SYS-006", currentVendor: "Dell EMC (File Server)", alternative: "Nextcloud", type: "open-source", description: "Self-hosted file storage and collaboration. GDPR-compliant, WebDAV, federation support.", url: "https://nextcloud.com", apisToDecouple: ["API-011"], effort: "medium" },
  { systemId: "SYS-006", currentVendor: "Dell EMC (File Server)", alternative: "MinIO", type: "open-source", description: "S3-compatible object storage. Can replace traditional file servers with modern API-first storage.", url: "https://min.io", apisToDecouple: ["API-011"], effort: "medium" },
  { systemId: "SYS-008", currentVendor: "Esri / Lantmäteriet", alternative: "QGIS Server + PostGIS", type: "open-source", description: "Full open-source GIS stack. OGC-compliant WMS/WFS services with PostGIS spatial database.", url: "https://qgis.org", apisToDecouple: ["API-006"], effort: "medium" },
  { systemId: "SYS-008", currentVendor: "Esri / Lantmäteriet", alternative: "GeoServer", type: "open-source", description: "Java-based open-source server for sharing geospatial data. OGC standards support.", url: "https://geoserver.org", apisToDecouple: ["API-006"], effort: "medium" },
  { systemId: "SYS-009", currentVendor: "IST (School Platform)", alternative: "Skolplattformen (Open Source)", type: "open-source", description: "Open-source school platform initiative inspired by Stockholm's Skolplattformen. API-first design.", url: "https://github.com/kolplattformen", apisToDecouple: ["API-007"], effort: "high" },
  { systemId: "SYS-011", currentVendor: "Microsoft (Exchange Online)", alternative: "Zimbra", type: "open-source", description: "Open-source email and collaboration suite. Full Exchange replacement with CalDAV/CardDAV.", url: "https://www.zimbra.com", apisToDecouple: ["API-009"], effort: "high" },
  { systemId: "SYS-012", currentVendor: "Microsoft (SharePoint)", alternative: "XWiki", type: "open-source", description: "Enterprise wiki and collaboration platform. REST API, structured content, extensible.", url: "https://www.xwiki.org", apisToDecouple: ["API-012"], effort: "medium" },
  { systemId: "SYS-012", currentVendor: "Microsoft (SharePoint)", alternative: "BookStack", type: "open-source", description: "Simple, self-hosted wiki/knowledge base. Easy migration from SharePoint content.", url: "https://www.bookstackapp.com", apisToDecouple: ["API-012"], effort: "low" },
];

const lockInColors: Record<string, string> = {
  high: "hsl(0, 72%, 51%)",
  medium: "hsl(38, 92%, 50%)",
  low: "hsl(152, 60%, 40%)",
};

const effortLabels: Record<string, string> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

export default function ApiManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: rawApis, isLoading } = useApis();
  const { data: rawSystems } = useSystems();

  const apis = useMemo(() => (rawApis || []).map(dbApiToPlatform), [rawApis]);
  const systems = useMemo(() => (rawSystems || []).map(dbSystemToPlatform), [rawSystems]);

  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState<string>("");
  const [selectedApi, setSelectedApi] = useState<PlatformApi | null>(null);
  const [databankSearch, setDatabankSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("catalog");
  const [familyDialog, setFamilyDialog] = useState<"internal" | "partner" | "public" | null>(null);

  // Deep-link: auto-select API from URL param
  useEffect(() => {
    const apiId = searchParams.get("api");
    if (apiId && apis.length > 0 && !selectedApi) {
      const found = apis.find(a => a.id === apiId);
      if (found) {
        setSelectedApi(found);
        setActiveTab("catalog");
        searchParams.delete("api");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [apis, searchParams]);

  const filtered = useMemo(() => {
    let data = apis;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    if (familyFilter) data = data.filter(a => a.type === familyFilter);
    return data;
  }, [apis, search, familyFilter]);

  // Family dialog APIs
  const familyDialogApis = useMemo(() => {
    if (!familyDialog) return [];
    return apis.filter(a => a.type === familyDialog);
  }, [apis, familyDialog]);

  // Databank filtering
  const filteredAlternatives = useMemo(() => {
    let items = [...alternatives];
    if (riskFilter !== "all") {
      const systemsWithRisk = systems.filter(s => s.lockInRisk === riskFilter).map(s => s.id);
      items = items.filter(a => systemsWithRisk.includes(a.systemId));
    }
    if (databankSearch) {
      const q = databankSearch.toLowerCase();
      items = items.filter(a =>
        a.alternative.toLowerCase().includes(q) ||
        a.currentVendor.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        systems.find(s => s.id === a.systemId)?.name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [databankSearch, riskFilter, systems]);

  const groupedBySystem = useMemo(() => {
    const groups: Record<string, Alternative[]> = {};
    filteredAlternatives.forEach(a => {
      if (!groups[a.systemId]) groups[a.systemId] = [];
      groups[a.systemId].push(a);
    });
    return groups;
  }, [filteredAlternatives]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading APIs…</p></div>;

  if (apis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Globe className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">No APIs Registered</h2>
        <p className="text-sm text-muted-foreground max-w-md">Run the seed-demo function to populate API data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Management</h1>
        <p className="text-sm text-muted-foreground mt-1">API catalog, access families, database alternatives</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="databank">Database</TabsTrigger>
        </TabsList>

        {/* ─── Catalog Tab ─── */}
        <TabsContent value="catalog" className="space-y-6">
          {/* API Families — clickable to open filtered dialog */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["internal", "partner", "public"] as const).map(type => {
              const config = familyConfig[type];
              const count = apis.filter(a => a.type === type).length;
              return (
                <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border p-5 card-shadow cursor-pointer hover:border-primary/30 transition-colors"
                  style={{ borderLeftWidth: 4, borderLeftColor: config.color }}
                  onClick={() => setFamilyDialog(type)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: config.bg }}>
                        <config.icon className="h-4 w-4" style={{ color: config.color }} />
                      </div>
                      <h3 className="text-sm font-semibold">{config.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: config.bg, color: config.color }}>{config.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{config.desc}</p>
                  <p className="text-2xl font-bold" style={{ color: config.color }}>{count}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search APIs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <ToggleGroup type="single" value={familyFilter} onValueChange={v => setFamilyFilter(v)}>
              <ToggleGroupItem value="internal" className="text-xs">Internal</ToggleGroupItem>
              <ToggleGroupItem value="partner" className="text-xs">Partner</ToggleGroupItem>
              <ToggleGroupItem value="public" className="text-xs">Public</ToggleGroupItem>
            </ToggleGroup>
            {(search || familyFilter) && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => { setSearch(""); setFamilyFilter(""); }}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>

          {/* API Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">API</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">System</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Protocol</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Auth</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Version</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Problems Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(api => {
                    const sys = systems.find(s => s.id === api.linkedSystemId);
                    const config = familyConfig[api.type];
                    return (
                      <tr key={api.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedApi(api)}>
                        <td className="p-3">
                          <p className="font-medium">{api.name}</p>
                          <p className="text-[10px] text-muted-foreground">{api.endpoint}</p>
                        </td>
                        <td className="p-3"><Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: config.bg, color: config.color }}>{api.type}</Badge></td>
                        <td className="p-3">{sys ? <Link to={`/system-map?system=${sys.id}`} className="text-primary text-xs hover:underline" onClick={e => e.stopPropagation()}>{sys.name}</Link> : <span className="text-muted-foreground text-xs">—</span>}</td>
                        <td className="p-3 text-muted-foreground text-xs font-mono">{api.protocol}</td>
                        <td className="p-3 text-muted-foreground text-xs">{api.authentication}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{api.version}</td>
                        <td className="p-3"><div className="flex flex-wrap gap-1">{api.problemsSolved.slice(0, 2).map(p => <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)}{api.problemsSolved.length > 2 && <Badge variant="secondary" className="text-[10px]">+{api.problemsSolved.length - 2}</Badge>}</div></td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No APIs match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* ─── Databank Tab ─── */}
        <TabsContent value="databank" className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alternatives, vendors, systems..." value={databankSearch} onChange={e => setDatabankSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Lock-in Risk" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            {(databankSearch || riskFilter !== "all") && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => { setDatabankSearch(""); setRiskFilter("all"); }}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>

          {Object.entries(groupedBySystem).length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No alternatives match your filters.</p>
          )}

          {Object.entries(groupedBySystem).map(([systemId, alts]) => {
            const system = systems.find(s => s.id === systemId);
            if (!system) return null;
            return (
              <motion.div key={systemId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border card-shadow overflow-hidden">
                <div className="p-5 border-b bg-muted/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Link to={`/system-map?system=${systemId}`} className="font-medium text-foreground hover:text-primary transition-colors">{system.name}</Link>
                        <p className="text-xs text-muted-foreground">{system.vendor} · {system.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${lockInColors[system.lockInRisk]}15`, color: lockInColors[system.lockInRisk] }}>
                        <ShieldAlert className="h-3 w-3 mr-1" />{system.lockInRisk} lock-in
                      </Badge>
                      <Badge variant="outline" className="text-xs">{system.annualCost.toLocaleString()} kSEK/yr</Badge>
                    </div>
                  </div>
                </div>
                <div className="divide-y">
                  {alts.map((alt, i) => {
                    const relatedApis = apis.filter(a => alt.apisToDecouple.includes(a.id));
                    return (
                      <div key={i} className="p-5 hover:bg-muted/10 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-foreground">{alt.alternative}</h4>
                              <Badge variant="secondary" className="text-[10px]">{alt.type}</Badge>
                              <Badge variant="outline" className="text-[10px]">{effortLabels[alt.effort]}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alt.description}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                              <span className="text-muted-foreground/60">Replaces:</span>
                              <span>{alt.currentVendor}</span>
                              <ArrowRight className="h-3 w-3 mx-1" />
                              <span className="text-primary font-medium">{alt.alternative}</span>
                            </div>
                            {relatedApis.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                <span className="text-[10px] text-muted-foreground/60 mr-1">Decouples:</span>
                                {relatedApis.map(api => <Badge key={api.id} variant="outline" className="text-[10px]">{api.name}</Badge>)}
                              </div>
                            )}
                          </div>
                          <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 shrink-0 hover:underline">
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Family Dialog — shows filtered APIs by type */}
      <Dialog open={!!familyDialog} onOpenChange={() => setFamilyDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {familyDialog && (() => {
            const config = familyConfig[familyDialog];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <config.icon className="h-5 w-5" style={{ color: config.color }} />
                    {config.title} ({familyDialogApis.length})
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  {familyDialogApis.map(api => {
                    const sys = systems.find(s => s.id === api.linkedSystemId);
                    return (
                      <div key={api.id} className="p-3 rounded-lg border hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => { setFamilyDialog(null); setSelectedApi(api); }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{api.name}</p>
                            <p className="text-xs text-muted-foreground">{api.endpoint}</p>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono">{api.version}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{api.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {sys && <span>System: {sys.name}</span>}
                          <span>Protocol: {api.protocol}</span>
                          <span>Auth: {api.authentication}</span>
                        </div>
                        {familyDialog === "partner" && api.developerMunicipality && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{api.developerMunicipality}</span>
                            {api.developerContact && <a href={`mailto:${api.developerContact}`} className="text-primary hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}><Mail className="h-3 w-3" />{api.developerContact}</a>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* API Detail Drawer */}
      <Sheet open={!!selectedApi} onOpenChange={() => setSelectedApi(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedApi && (() => {
            const sys = systems.find(s => s.id === selectedApi.linkedSystemId);
            const config = familyConfig[selectedApi.type];
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedApi.name}</SheetTitle>
                  <SheetDescription>{selectedApi.id} · {selectedApi.type}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-muted-foreground">Access Family</p><Badge style={{ backgroundColor: config.bg, color: config.color }}>{selectedApi.type}</Badge></div>
                    <div><p className="text-muted-foreground">Protocol</p><p className="font-medium font-mono">{selectedApi.protocol}</p></div>
                    <div><p className="text-muted-foreground">Version</p><p className="font-medium font-mono">{selectedApi.version}</p></div>
                    <div><p className="text-muted-foreground">Rate Limit</p><p className="font-medium">{selectedApi.rateLimitPerMin}/min</p></div>
                    <div><p className="text-muted-foreground">Authentication</p><p className="font-medium">{selectedApi.authentication}</p></div>
                    <div><p className="text-muted-foreground">Endpoint</p><p className="font-medium font-mono text-xs break-all">{selectedApi.endpoint}</p></div>
                  </div>
                  <div><p className="font-semibold text-foreground mb-1">Description</p><p className="text-muted-foreground">{selectedApi.description}</p></div>
                  {selectedApi.problemsSolved.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Problems Solved</p><div className="flex flex-wrap gap-1">{selectedApi.problemsSolved.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div></div>
                  )}
                  {/* Partner municipality info */}
                  {selectedApi.type === "partner" && selectedApi.developerMunicipality && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                      <p className="font-semibold text-foreground mb-1">Developer / Partner Municipality</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedApi.developerMunicipality}</span>
                      </div>
                      {selectedApi.developerContact && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${selectedApi.developerContact}`} className="text-primary hover:underline">{selectedApi.developerContact}</a>
                        </div>
                      )}
                    </div>
                  )}
                  {sys && (
                    <div><p className="font-semibold text-foreground mb-1">Linked System</p>
                      <Link to={`/system-map?system=${sys.id}`} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-secondary transition-colors">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div><p className="text-xs font-medium">{sys.name}</p><p className="text-[10px] text-muted-foreground">{sys.vendor} · {sys.lifecycle}</p></div>
                      </Link>
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
