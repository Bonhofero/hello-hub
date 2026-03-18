import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, ShieldAlert, Layers, ArrowRight } from "lucide-react";
import { useSystems, useApis, dbSystemToPlatform, dbApiToPlatform } from "@/hooks/useDatabase";

interface Alternative {
  systemId: string;
  currentVendor: string;
  alternative: string;
  type: "open-source" | "open-standard" | "api-decoupling";
  description: string;
  url: string;
  apisToDecouple: string[];
  effort: "low" | "medium" | "high";
}

const alternatives: Alternative[] = [
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

export default function ApiDatabank() {
  const { data: rawSystems } = useSystems();
  const { data: rawApis } = useApis();

  const systems = useMemo(() => (rawSystems || []).map(dbSystemToPlatform), [rawSystems]);
  const apis = useMemo(() => (rawApis || []).map(dbApiToPlatform), [rawApis]);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const filteredAlternatives = useMemo(() => {
    let items = [...alternatives];
    if (riskFilter !== "all") {
      const systemsWithRisk = systems.filter(s => s.lockInRisk === riskFilter).map(s => s.id);
      items = items.filter(a => systemsWithRisk.includes(a.systemId));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a =>
        a.alternative.toLowerCase().includes(q) ||
        a.currentVendor.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        systems.find(s => s.id === a.systemId)?.name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, riskFilter, systems]);

  const groupedBySystem = useMemo(() => {
    const groups: Record<string, Alternative[]> = {};
    filteredAlternatives.forEach(a => {
      if (!groups[a.systemId]) groups[a.systemId] = [];
      groups[a.systemId].push(a);
    });
    return groups;
  }, [filteredAlternatives]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Database</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Open-source alternatives and API strategies to reduce vendor lock-in
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search alternatives, vendors, systems..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
      </div>

      {Object.entries(groupedBySystem).length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No alternatives match your filters.</p>
      )}

      {Object.entries(groupedBySystem).map(([systemId, alts]) => {
        const system = systems.find(s => s.id === systemId);
        if (!system) return null;

        return (
          <motion.div
            key={systemId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border card-shadow overflow-hidden"
          >
            <div className="p-5 border-b bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Link to={`/system-map?system=${systemId}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {system.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{system.vendor} · {system.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${lockInColors[system.lockInRisk]}15`, color: lockInColors[system.lockInRisk] }}>
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    {system.lockInRisk} lock-in
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
                            {relatedApis.map(api => (
                              <Badge key={api.id} variant="outline" className="text-[10px]">{api.name}</Badge>
                            ))}
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
    </div>
  );
}
