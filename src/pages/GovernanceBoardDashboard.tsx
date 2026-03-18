import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  FileText, AlertTriangle, Clock, Target, TrendingUp, ShieldAlert, ArrowRight, UserX, ClipboardCheck, Check
} from "lucide-react";
import {
  useGovernanceDocs, useContradictions, useRisks, useOrganizations,
  dbGovDocToPlatform, dbContradictionToPlatform, dbRiskToPlatform,
  getReviewStatus, getDaysUntilReview, securityCheckLabels, strategicGoals,
  type GovDoc, type GovContradiction,
} from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ─── Audit Wizard Sub-Components ──────────────────────────────────────────────

interface Step1Data { [docId: string]: { owner: string; ownerTitle: string; skipped: boolean; retired: boolean } }
interface Step2Data { [docId: string]: "active" | "redundant" | "contradictory" }

function AuditStepper({ step }: { step: number }) {
  const steps = ["Assign Ownership", "Categorize Portfolio", "Rationalization Plan"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}

export default function GovernanceBoardDashboard() {
  const queryClient = useQueryClient();
  const { data: rawDocs, isLoading } = useGovernanceDocs();
  const { data: rawContradictions } = useContradictions();
  const { data: rawRisks } = useRisks();
  const { data: rawOrgs } = useOrganizations();

  const docs = useMemo(() => (rawDocs || []).map(dbGovDocToPlatform), [rawDocs]);
  const contradictions = useMemo(() => (rawContradictions || []).map(dbContradictionToPlatform), [rawContradictions]);
  const risks = useMemo(() => (rawRisks || []).map(dbRiskToPlatform), [rawRisks]);
  const org = useMemo(() => (rawOrgs || [])[0], [rawOrgs]);

  const totalActive = docs.filter(d => d.status === "Active").length;
  const overdue = docs.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue");
  const escalated = docs.filter(d => d.escalatedToBoard);
  const orphaned = docs.filter(d => !d.hasOwner || !d.owner || d.owner.trim() === "");
  const unresolvedContradictions = contradictions.filter(c => !c.resolved);
  const boardRisks = risks.filter(r => r.boardVisibility);
  const urgent = docs.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "urgent");

  const secKeys = Object.keys(securityCheckLabels);
  const complianceSummary = secKeys.map(key => {
    const compliant = docs.filter(d => d.securityChecks[key]).length;
    return { key, label: securityCheckLabels[key], compliant, total: docs.length, pct: docs.length > 0 ? Math.round(compliant / docs.length * 100) : 0 };
  });

  const goalLinks = strategicGoals.map(goal => ({
    goal,
    docs: docs.filter(d => d.strategicGoals.includes(goal)),
    atRisk: overdue.some(d => d.strategicGoals.includes(goal)),
  }));

  // ─── Audit Wizard State ─────────────────────────────────────────────────────
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditStep, setAuditStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({});
  const [step2Data, setStep2Data] = useState<Step2Data>({});

  const orphanedDocs = useMemo(() => docs.filter(d => !d.hasOwner || !d.owner || d.owner.trim() === ""), [docs]);
  const activeDocs = useMemo(() => docs.filter(d => d.status === "Active"), [docs]);

  const openAudit = () => {
    const s1: Step1Data = {};
    orphanedDocs.forEach(d => { s1[d.id] = { owner: "", ownerTitle: "", skipped: false, retired: false }; });
    setStep1Data(s1);
    const s2: Step2Data = {};
    activeDocs.forEach(d => { s2[d.id] = "active"; });
    // Pre-select contradictory
    unresolvedContradictions.forEach(c => {
      if (s2[c.docAId] !== undefined) s2[c.docAId] = "contradictory";
      if (s2[c.docBId] !== undefined) s2[c.docBId] = "contradictory";
    });
    setStep2Data(s2);
    setAuditStep(1);
    setAuditOpen(true);
  };

  const step1Complete = Object.entries(step1Data).every(([, v]) => v.skipped || v.retired || v.owner.trim() !== "");
  const step2Complete = Object.values(step2Data).every(v => !!v);

  // Step 3 computed groups
  const archiveDocs = useMemo(() => activeDocs.filter(d => step2Data[d.id] === "redundant"), [activeDocs, step2Data]);
  const escalateDocs = useMemo(() => activeDocs.filter(d => step2Data[d.id] === "contradictory"), [activeDocs, step2Data]);
  const ownershipUpdated = useMemo(() => Object.entries(step1Data).filter(([, v]) => !v.skipped && !v.retired && v.owner.trim() !== ""), [step1Data]);

  const completeAudit = async () => {
    // Archive redundant docs
    for (const doc of archiveDocs) {
      await (supabase as any).from("governance_documents").update({ status: "Archived" }).eq("id", doc.id);
    }
    // Escalate contradictory docs
    for (const doc of escalateDocs) {
      await (supabase as any).from("governance_documents").update({ escalated_to_board: true }).eq("id", doc.id);
    }
    // Update ownership
    for (const [docId, v] of ownershipUpdated) {
      if (v.retired) {
        await (supabase as any).from("governance_documents").update({ status: "Archived" }).eq("id", docId);
      } else {
        await (supabase as any).from("governance_documents").update({ owner: v.owner, owner_title: v.ownerTitle, has_owner: true }).eq("id", docId);
      }
    }
    // Update last audit date
    if (org?.id) {
      await (supabase as any).from("organizations").update({ last_audit_date: new Date().toISOString().split("T")[0] }).eq("id", org.id);
    }
    queryClient.invalidateQueries({ queryKey: ["governance_documents"] });
    queryClient.invalidateQueries({ queryKey: ["organizations"] });
    toast({ title: "Governance audit complete", description: `${archiveDocs.length} archived · ${escalateDocs.length} escalated · ${ownershipUpdated.length} ownership records updated.` });
    setAuditOpen(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading board dashboard…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Board Dashboard</h1>
          <p className="text-muted-foreground">Leadership overview — Eskilstuna Municipality</p>
        </div>
        <Button variant="outline" onClick={openAudit} className="gap-2"><ClipboardCheck className="h-4 w-4" /> Run Governance Audit</Button>
      </div>

      {/* Last audit info */}
      <p className="text-xs text-muted-foreground">
        Last audit: {org?.last_audit_date ? format(new Date(org.last_audit_date), "d MMM yyyy") : "No audit run yet."}
      </p>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card><CardContent className="pt-4 pb-4 text-center">
          <FileText className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalActive}</p>
          <p className="text-xs text-muted-foreground">Active Documents</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold text-destructive">{overdue.length}</p>
          <p className="text-xs text-muted-foreground">Overdue Reviews</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <ShieldAlert className="h-6 w-6 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold text-destructive">{unresolvedContradictions.length}</p>
          <p className="text-xs text-muted-foreground">Contradictions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <Clock className="h-6 w-6 mx-auto text-warning mb-1" />
          <p className="text-2xl font-bold text-warning">{escalated.length}</p>
          <p className="text-xs text-muted-foreground">Escalated Items</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <UserX className="h-6 w-6 mx-auto text-warning mb-1" />
          <p className="text-2xl font-bold text-warning">{orphaned.length}</p>
          <p className="text-xs text-muted-foreground">Orphaned Docs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{boardRisks.length}</p>
          <p className="text-xs text-muted-foreground">Board-Level Risks</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <Target className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{goalLinks.filter(g => g.atRisk).length}</p>
          <p className="text-xs text-muted-foreground">Goals at Risk</p>
        </CardContent></Card>
      </div>

      {/* Needs Attention This Month */}
      <Card className="border-warning/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Needs Attention This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {urgent.slice(0, 5).map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-warning/5 border-warning/20">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.owner || "No owner"} · {doc.unit}</p>
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/20 text-xs shrink-0">{getDaysUntilReview(doc.reviewDate)}d left</Badge>
            </div>
          ))}
          {urgent.length === 0 && <p className="text-sm text-muted-foreground">No urgent reviews this month.</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Escalated Items */}
        <Card>
          <CardHeader><CardTitle className="text-base">Escalated to Board</CardTitle></CardHeader>
          <CardContent className="p-0">
            {escalated.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No escalated items.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Owner</TableHead><TableHead>Review</TableHead></TableRow></TableHeader>
                <TableBody>
                  {escalated.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell><p className="font-medium text-sm">{doc.title}</p><p className="text-xs text-muted-foreground">{doc.id}</p></TableCell>
                      <TableCell className="text-sm">{doc.owner || "—"}</TableCell>
                      <TableCell>{doc.reviewDate && getReviewStatus(doc.reviewDate) === "overdue" ? <Badge className="bg-destructive/10 text-destructive border-destructive/20">{Math.abs(getDaysUntilReview(doc.reviewDate))}d overdue</Badge> : <Badge variant="secondary">{doc.reviewDate ? `${getDaysUntilReview(doc.reviewDate)}d` : "N/A"}</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Contradictions */}
        <Card className={unresolvedContradictions.length > 0 ? "border-destructive/30" : ""}>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Unresolved Contradictions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {unresolvedContradictions.map(c => (
              <div key={c.id} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
                <p className="text-sm text-foreground">{c.description.substring(0, 150)}…</p>
                {c.ruleConflict && <p className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">Conflict:</span> {c.ruleConflict.substring(0, 120)}…</p>}
                {c.whyMatters && <p className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">Impact:</span> {c.whyMatters.substring(0, 120)}…</p>}
                <Badge variant="secondary" className="text-[10px]">{c.severity}</Badge>
              </div>
            ))}
            {unresolvedContradictions.length === 0 && <p className="text-sm text-muted-foreground">No unresolved contradictions.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Board-Level Risks */}
      {boardRisks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Board-Level Risks</CardTitle><CardDescription>Risks escalated for leadership visibility</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {boardRisks.map(r => (
              <Link key={r.id} to={`/risk?risk=${r.id}`} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="mt-1 h-2 w-2 rounded-full bg-destructive animate-pulse-slow shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type} · Due {r.dueDate} · {r.owner}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compliance Summary */}
      <Card>
        <CardHeader><CardTitle className="text-base">Security Design Principles Coverage</CardTitle><CardDescription>How many governance documents evaluate each principle</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {complianceSummary.map(c => (
            <div key={c.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{c.label}</span>
                <span className="text-xs font-medium text-muted-foreground">{c.pct}% ({c.compliant}/{c.total})</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.pct >= 80 ? "hsl(152, 60%, 40%)" : c.pct >= 60 ? "hsl(199, 89%, 48%)" : "hsl(38, 92%, 50%)" }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strategic Goal Alignment */}
      <Card>
        <CardHeader><CardTitle className="text-base">Strategic Goal Alignment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {goalLinks.map(({ goal, docs: goalDocs, atRisk }) => (
            <div key={goal} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> {goal}</p>
                <div className="flex items-center gap-2">
                  {atRisk && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">At Risk</Badge>}
                  <Badge variant="secondary">{goalDocs.length} initiative{goalDocs.length !== 1 ? "s" : ""}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">{goalDocs.map(d => <Badge key={d.id} variant="outline" className="text-xs">{d.id}: {d.title.substring(0, 40)}{d.title.length > 40 ? "…" : ""}</Badge>)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ─── Governance Audit Dialog ─── */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Governance Audit</DialogTitle>
            <DialogDescription>
              {auditStep === 1 && "Step 1: Review documents with missing or unassigned owners"}
              {auditStep === 2 && "Step 2: Review each document and classify its current status"}
              {auditStep === 3 && "Step 3: Confirm actions generated from your review"}
            </DialogDescription>
          </DialogHeader>
          <AuditStepper step={auditStep} />

          {/* STEP 1 */}
          {auditStep === 1 && (
            <div className="space-y-3">
              {orphanedDocs.length === 0 ? (
                <div className="flex items-center gap-2 p-4 rounded-lg border border-success/30 bg-success/5">
                  <Check className="h-5 w-5 text-success" />
                  <p className="text-sm font-medium text-success">All documents have owners ✓</p>
                </div>
              ) : orphanedDocs.map(doc => {
                const d = step1Data[doc.id] || { owner: "", ownerTitle: "", skipped: false, retired: false };
                return (
                  <div key={doc.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.category} · {doc.domain}</p>
                      </div>
                      {doc.reviewDate && <Badge variant="secondary" className="text-xs">{getDaysUntilReview(doc.reviewDate)}d</Badge>}
                    </div>
                    {!d.skipped && !d.retired && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Owner Name" value={d.owner} onChange={e => setStep1Data(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], owner: e.target.value } }))} className="text-xs" />
                        <Input placeholder="Owner Title" value={d.ownerTitle} onChange={e => setStep1Data(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], ownerTitle: e.target.value } }))} className="text-xs" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant={d.retired ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setStep1Data(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], retired: !d.retired, skipped: false } }))}>
                        {d.retired ? "✓ Retired" : "Mark as Retired"}
                      </Button>
                      <Button variant={d.skipped ? "default" : "ghost"} size="sm" className="text-xs" onClick={() => setStep1Data(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], skipped: !d.skipped, retired: false } }))}>
                        {d.skipped ? "✓ Skipped" : "Skip"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2 */}
          {auditStep === 2 && (
            <div className="space-y-2">
              {activeDocs.map(doc => {
                const val = step2Data[doc.id] || "active";
                const con = unresolvedContradictions.find(c => c.docAId === doc.id || c.docBId === doc.id);
                return (
                  <div key={doc.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{doc.title}</p>
                      <div className="flex gap-1">
                        {(["active", "redundant", "contradictory"] as const).map(opt => (
                          <Button key={opt} size="sm" variant={val === opt ? "default" : "outline"} className="text-xs"
                            onClick={() => setStep2Data(prev => ({ ...prev, [doc.id]: opt }))}>
                            {opt === "active" ? "✅ Active" : opt === "redundant" ? "⚠ Redundant" : "❌ Contradictory"}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {val === "contradictory" && con && (
                      <p className="text-xs text-muted-foreground bg-destructive/5 p-2 rounded">{con.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3 */}
          {auditStep === 3 && (
            <div className="space-y-4">
              {archiveDocs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">📦 Scheduled for Archive ({archiveDocs.length})</p>
                  {archiveDocs.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded border mb-1">
                      <p className="text-xs">{d.title}</p>
                      <Badge variant="secondary" className="text-xs">Archive in 30d</Badge>
                    </div>
                  ))}
                </div>
              )}
              {escalateDocs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">🚨 Escalated for Resolution ({escalateDocs.length})</p>
                  {escalateDocs.map(d => {
                    const con = unresolvedContradictions.find(c => c.docAId === d.id || c.docBId === d.id);
                    return (
                      <div key={d.id} className="p-2 rounded border mb-1">
                        <p className="text-xs font-medium">{d.title}</p>
                        {con && <p className="text-xs text-muted-foreground">{con.description.substring(0, 100)}…</p>}
                      </div>
                    );
                  })}
                </div>
              )}
              {ownershipUpdated.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">👤 Ownership Updated ({ownershipUpdated.length})</p>
                  {ownershipUpdated.map(([docId, v]) => {
                    const d = docs.find(doc => doc.id === docId);
                    return (
                      <div key={docId} className="flex items-center justify-between p-2 rounded border mb-1">
                        <p className="text-xs">{d?.title || docId}</p>
                        <span className="text-xs text-muted-foreground">{v.retired ? "Retired" : `→ ${v.owner}`}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {archiveDocs.length === 0 && escalateDocs.length === 0 && ownershipUpdated.length === 0 && (
                <p className="text-sm text-muted-foreground">No actions to confirm.</p>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {auditStep > 1 && <Button variant="outline" onClick={() => setAuditStep(s => s - 1 as 1 | 2 | 3)}>Back</Button>}
            <Button variant="outline" onClick={() => setAuditOpen(false)}>Cancel</Button>
            {auditStep < 3 ? (
              <Button onClick={() => setAuditStep(s => s + 1 as 1 | 2 | 3)} disabled={auditStep === 1 ? !step1Complete && orphanedDocs.length > 0 : !step2Complete}>
                Next →
              </Button>
            ) : (
              <Button onClick={completeAudit}>Complete Audit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
