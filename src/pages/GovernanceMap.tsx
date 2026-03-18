import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertTriangle, CheckCircle2, XCircle, ExternalLink, ShieldAlert, UserX } from "lucide-react";
import {
  useGovernanceDocs, useContradictions, useGovernanceStandards, useSystems, useRisks, useApis,
  dbGovDocToPlatform, dbContradictionToPlatform, dbStandardToPlatform, dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform,
  getReviewStatus, getDaysUntilReview, securityCheckLabels, domains, enrichSystems,
  type GovDoc
} from "@/hooks/useDatabase";

const domainColors: Record<string, string> = {
  "IT & Digitalization": "border-primary/40 bg-primary/5",
  "HR & Organization": "border-warning/40 bg-warning/5",
  "Social Services": "border-accent/40 bg-accent/5",
  "Education": "border-info/40 bg-info/5",
  "Urban Planning": "border-success/40 bg-success/5",
  "Administration & Governance": "border-muted-foreground/40 bg-muted/50",
};

export default function GovernanceMap() {
  const { data: rawDocs, isLoading } = useGovernanceDocs();
  const { data: rawContradictions } = useContradictions();
  const { data: rawStandards } = useGovernanceStandards();
  const { data: rawSystems } = useSystems();
  const { data: rawRisks } = useRisks();
  const { data: rawApis } = useApis();

  const docs = useMemo(() => (rawDocs || []).map(dbGovDocToPlatform), [rawDocs]);
  const contradictions = useMemo(() => (rawContradictions || []).map(dbContradictionToPlatform), [rawContradictions]);
  const standards = useMemo(() => (rawStandards || []).map(dbStandardToPlatform), [rawStandards]);
  const systems = useMemo(() => enrichSystems((rawSystems || []).map(dbSystemToPlatform), (rawRisks || []).map(dbRiskToPlatform), (rawApis || []).map(dbApiToPlatform)), [rawSystems, rawRisks, rawApis]);
  const risks = useMemo(() => (rawRisks || []).map(dbRiskToPlatform), [rawRisks]);

  const [selectedDoc, setSelectedDoc] = useState<GovDoc | null>(null);

  const grouped = domains.map(domain => ({
    domain,
    docs: docs.filter(d => d.domain === domain),
  }));

  const hasContradiction = (docId: string) => contradictions.some(c => (c.docAId === docId || c.docBId === docId) && !c.resolved);

  const getLinkedSystems = (doc: GovDoc) => systems.filter(s => s.linkedGovDocs.includes(doc.id));
  const getLinkedRisks = (doc: GovDoc) => {
    const systemIds = getLinkedSystems(doc).map(s => s.id);
    return risks.filter(r => systemIds.includes(r.linkedSystemId));
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Governance Map</h1>
        <p className="text-muted-foreground">Visual overview of governance documents by domain</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive inline-block" /> Overdue</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning inline-block" /> Due within 30d</span>
        <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> Contradiction</span>
        <span className="flex items-center gap-1"><UserX className="h-3 w-3 text-warning" /> No owner</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success inline-block" /> OK</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {grouped.map(({ domain, docs: domDocs }) => {
          const overdueCount = domDocs.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue").length;
          const contradictionCount = domDocs.filter(d => hasContradiction(d.id)).length;
          const orphanedCount = domDocs.filter(d => !d.hasOwner || !d.owner).length;
          return (
            <Card key={domain} className={`${domainColors[domain] || ""} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                  {domain}
                  <div className="flex gap-1">
                    {overdueCount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{overdueCount} overdue</Badge>}
                    {contradictionCount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{contradictionCount} conflict</Badge>}
                    {orphanedCount > 0 && <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">{orphanedCount} orphaned</Badge>}
                  </div>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{domDocs.length} document{domDocs.length !== 1 ? "s" : ""}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {domDocs.length === 0 && <p className="text-xs text-muted-foreground italic">No documents in this domain.</p>}
                {domDocs.map(doc => {
                  const status = doc.reviewDate ? getReviewStatus(doc.reviewDate) : "ok";
                  const conflict = hasContradiction(doc.id);
                  const isOrphaned = !doc.hasOwner || !doc.owner || doc.owner.trim() === "";
                  return (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-card/80 ${
                        status === "overdue" ? "border-destructive/40 bg-destructive/5" :
                        conflict ? "border-destructive/30 bg-destructive/5" :
                        status === "urgent" ? "border-warning/40 bg-warning/5" : "border-border bg-card"
                      }`}
                    >
                      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                        status === "overdue" ? "bg-destructive" : status === "urgent" ? "bg-warning" : "bg-success"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.owner || "No owner"} · {doc.id}</p>
                        {doc.linkedStandards.length > 0 && (
                          <div className="flex gap-0.5 mt-1 flex-wrap">
                            {doc.linkedStandards.slice(0, 2).map(id => {
                              const s = standards.find(x => x.id === id);
                              return s ? <Badge key={id} variant="outline" className="text-[9px] px-1 py-0">{s.name.substring(0, 15)}</Badge> : null;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {conflict && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {isOrphaned && <UserX className="h-4 w-4 text-warning" />}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedDoc && (() => {
            const linkedSystems = getLinkedSystems(selectedDoc);
            const linkedRisks = getLinkedRisks(selectedDoc);
            const docContradictions = contradictions.filter(c => (c.docAId === selectedDoc.id || c.docBId === selectedDoc.id) && !c.resolved);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedDoc.title}</SheetTitle>
                  <SheetDescription>{selectedDoc.id} · {selectedDoc.domain}</SheetDescription>
                </SheetHeader>

                <div className="mt-4 rounded-lg border bg-secondary/50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDoc.classification === "Operational"
                      ? `Operational governance document covering ${selectedDoc.domain || "general"} domain procedures. `
                      : `Development/innovation document guiding strategic initiatives in ${selectedDoc.domain || "the municipality"}. `}
                    {selectedDoc.owner ? `Owned by ${selectedDoc.owner}.` : "⚠ No assigned owner."}
                    {selectedDoc.reviewDate && getReviewStatus(selectedDoc.reviewDate) === "overdue"
                      ? ` Review overdue by ${Math.abs(getDaysUntilReview(selectedDoc.reviewDate))} days.`
                      : ""}
                    {docContradictions.length > 0 ? ` ${docContradictions.length} active contradiction${docContradictions.length > 1 ? "s" : ""}.` : ""}
                  </p>
                </div>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner</p>
                      {selectedDoc.owner ? <p className="font-medium text-foreground">{selectedDoc.owner}</p> : <Badge className="bg-warning/10 text-warning"><UserX className="h-3 w-3 mr-1" />Orphaned</Badge>}
                    </div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium text-foreground">{selectedDoc.unit}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p>
                      {selectedDoc.reviewDate ? (
                        <Badge className={getReviewStatus(selectedDoc.reviewDate) === "overdue" ? "bg-destructive/10 text-destructive" : getReviewStatus(selectedDoc.reviewDate) === "urgent" ? "bg-warning/10 text-warning" : ""}>{getDaysUntilReview(selectedDoc.reviewDate)}d {getReviewStatus(selectedDoc.reviewDate) === "overdue" ? "overdue" : "remaining"}</Badge>
                      ) : <p className="text-muted-foreground">Not set</p>}
                    </div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Classification</p><Badge variant="secondary">{selectedDoc.classification}</Badge></div>
                  </div>

                  {docContradictions.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-destructive flex items-center gap-1 text-sm"><AlertTriangle className="h-4 w-4" /> Contradictions</p>
                      {docContradictions.map(c => (
                        <div key={c.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                          <p className="text-sm text-muted-foreground">{c.description}</p>
                          {c.ruleConflict && <p className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">Rule:</span> {c.ruleConflict}</p>}
                          {c.whyMatters && <p className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">Impact:</span> {c.whyMatters}</p>}
                          {c.reviewNext && <p className="text-xs text-muted-foreground"><span className="font-semibold text-primary">Next:</span> {c.reviewNext}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDoc.strategicGoals.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Strategic Goals</p><div className="flex flex-wrap gap-1">{selectedDoc.strategicGoals.map(g => <Badge key={g} className="bg-primary/10 text-primary border-primary/20 text-xs">{g}</Badge>)}</div></div>
                  )}

                  <div>
                    <p className="font-semibold text-foreground mb-2">Security Design Principles</p>
                    {Object.entries(securityCheckLabels).map(([k, label]) => (
                      <div key={k} className="flex items-center gap-2 py-0.5">
                        {selectedDoc.securityChecks[k] ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {linkedSystems.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Linked Systems</p>
                      <div className="space-y-1">{linkedSystems.map(sys => (
                        <Link key={sys.id} to={`/system-map?system=${sys.id}`} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-secondary transition-colors">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0"><p className="text-xs font-medium truncate">{sys.name}</p><p className="text-[10px] text-muted-foreground">{sys.vendor} · {sys.lifecycle}</p></div>
                        </Link>
                      ))}</div>
                    </div>
                  )}

                  {linkedRisks.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Related Risks</p>
                      <div className="space-y-1">{linkedRisks.map(r => (
                        <Link key={r.id} to={`/risk?risk=${r.id}`} className="flex items-center gap-2 p-2 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                          <ShieldAlert className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <div className="min-w-0"><p className="text-xs font-medium truncate">{r.title}</p><p className="text-[10px] text-muted-foreground">{r.type} · Due {r.dueDate}</p></div>
                        </Link>
                      ))}</div>
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
