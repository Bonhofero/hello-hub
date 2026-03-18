import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, FileText, AlertTriangle, ChevronUp, ChevronDown, Download,
  CheckCircle2, XCircle, Clock, AlertCircle, Filter, ShieldAlert, ExternalLink, UserX, Plus, ArrowRight, ArrowLeft, Loader2, RotateCcw
} from "lucide-react";
import {
  useGovernanceDocs, useContradictions, useGovernanceStandards, useSystems, useRisks, useApis,
  dbGovDocToPlatform, dbContradictionToPlatform, dbStandardToPlatform, dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform,
  getDaysUntilReview, getReviewStatus, securityCheckLabels, units, domains, categories, enrichSystems,
  type GovDoc
} from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type SortField = "title" | "unit" | "classification" | "reviewDate" | "status" | "owner";
type SortDir = "asc" | "desc";
type SavedView = "all" | "overdue" | "contradictions" | "board" | "orphaned";

const savedViews: { value: SavedView; label: string }[] = [
  { value: "all", label: "All Documents" },
  { value: "overdue", label: "Overdue" },
  { value: "contradictions", label: "Contradictions" },
  { value: "board", label: "Board Escalated" },
  { value: "orphaned", label: "Orphaned" },
];

export default function GovernancePortfolio() {
  const { data: rawDocs, isLoading: docsLoading } = useGovernanceDocs();
  const { data: rawContradictions } = useContradictions();
  const { data: rawStandards } = useGovernanceStandards();
  const { data: rawSystems } = useSystems();
  const { data: rawRisks } = useRisks();
  const { data: rawApis } = useApis();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const docs = useMemo(() => (rawDocs || []).map(dbGovDocToPlatform), [rawDocs]);
  const contradictions = useMemo(() => (rawContradictions || []).map(dbContradictionToPlatform), [rawContradictions]);
  const standards = useMemo(() => (rawStandards || []).map(dbStandardToPlatform), [rawStandards]);
  const systems = useMemo(() => {
    const s = (rawSystems || []).map(dbSystemToPlatform);
    const r = (rawRisks || []).map(dbRiskToPlatform);
    const a = (rawApis || []).map(dbApiToPlatform);
    return enrichSystems(s, r, a);
  }, [rawSystems, rawRisks, rawApis]);
  const risks = useMemo(() => (rawRisks || []).map(dbRiskToPlatform), [rawRisks]);

  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [savedView, setSavedView] = useState<SavedView>("all");
  const [sortField, setSortField] = useState<SortField>("reviewDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedDoc, setSelectedDoc] = useState<GovDoc | null>(null);

  // Add Document Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "", owner: "", unit: "", domain: "", category: "", classification: "Operational" as "Operational" | "Development/Innovation",
    reviewDate: "", linkedStandards: [] as string[], strategicGoals: "" as string,
    securityChecks: {} as Record<string, boolean>,
    replacesDocId: "" as string,
  });

  const [autoChecked, setAutoChecked] = useState(false);
  const [accessibilityHelper, setAccessibilityHelper] = useState(false);

  // Category-based auto-check for security checks
  useEffect(() => {
    if (!newDoc.category) return;
    const categoryMap: Record<string, string[]> = {
      "GDPR Compliance": ["gdpr", "dataMin", "audit"],
      "Information Security": ["separation", "oauth", "audit", "dataMin", "gdpr", "centralized", "tls"],
      "IT Governance": ["centralized", "separation", "audit"],
      "Data Management": ["gdpr", "dataMin"],
      "Procurement": ["audit", "centralized"],
    };
    const checks = categoryMap[newDoc.category];
    setAccessibilityHelper(newDoc.category === "Accessibility");
    if (checks) {
      const updated: Record<string, boolean> = {};
      checks.forEach(k => { updated[k] = true; });
      setNewDoc(prev => ({ ...prev, securityChecks: updated }));
      setAutoChecked(true);
    } else {
      setAutoChecked(false);
    }
  }, [newDoc.category]);
  const filtered = useMemo(() => {
    let result = [...docs];
    if (savedView === "overdue") result = result.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue");
    else if (savedView === "contradictions") result = result.filter(d => contradictions.some(c => (c.docAId === d.id || c.docBId === d.id) && !c.resolved));
    else if (savedView === "board") result = result.filter(d => d.escalatedToBoard);
    else if (savedView === "orphaned") result = result.filter(d => !d.hasOwner || !d.owner || d.owner.trim() === "");

    if (search) result = result.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()));
    if (unitFilter !== "all") result = result.filter(d => d.unit === unitFilter);
    if (classFilter !== "all") result = result.filter(d => d.classification === classFilter);
    if (domainFilter !== "all") result = result.filter(d => d.domain === domainFilter);
    if (statusFilter !== "all") {
      if (statusFilter === "overdue") result = result.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue");
      else if (statusFilter === "urgent") result = result.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "urgent");
      else result = result.filter(d => d.status === statusFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "reviewDate") cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      else cmp = (a[sortField] || "").localeCompare(b[sortField] || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [docs, contradictions, search, unitFilter, classFilter, statusFilter, domainFilter, sortField, sortDir, savedView]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  const reviewBadge = (reviewDate: string) => {
    if (!reviewDate) return <Badge variant="secondary">N/A</Badge>;
    const s = getReviewStatus(reviewDate);
    const days = getDaysUntilReview(reviewDate);
    if (s === "overdue") return <Badge className="bg-destructive/10 text-destructive border-destructive/20">{Math.abs(days)}d overdue</Badge>;
    if (s === "urgent") return <Badge className="bg-warning/10 text-warning border-warning/20">{days}d left</Badge>;
    if (s === "upcoming") return <Badge className="bg-info/10 text-info border-info/20">{days}d</Badge>;
    return <Badge variant="secondary">{days}d</Badge>;
  };

  const handleExportCSV = () => {
    const headers = ["ID,Title,Owner,Unit,Classification,Category,Review Date,Status,Domain"];
    const rows = filtered.map(d => `${d.id},"${d.title}","${d.owner}","${d.unit}",${d.classification},${d.category},${d.reviewDate},${d.status},${d.domain}`);
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "governance-documents.csv"; a.click();
  };

  const docContradictions = (docId: string) => contradictions.filter(c => (c.docAId === docId || c.docBId === docId) && !c.resolved);

  const overdue = docs.filter(d => d.reviewDate && getReviewStatus(d.reviewDate) === "overdue").length;
  const activeContradictions = contradictions.filter(c => !c.resolved).length;

  const getLinkedSystems = (doc: GovDoc) => systems.filter(s => s.linkedGovDocs.includes(doc.id));
  const getLinkedRisks = (doc: GovDoc) => {
    const sysIds = getLinkedSystems(doc).map(s => s.id);
    return risks.filter(r => sysIds.includes(r.linkedSystemId));
  };

  const handleSubmitDoc = async () => {
    if (!newDoc.title || !newDoc.owner) {
      toast({ title: "Missing fields", description: "Title and owner are required.", variant: "destructive" });
      return;
    }
    setAddLoading(true);
    try {
      const docId = `GOV-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await (supabase as any).from("governance_documents").insert({
        id: docId,
        title: newDoc.title,
        owner: newDoc.owner,
        unit: newDoc.unit || null,
        domain: newDoc.domain || null,
        category: newDoc.category || null,
        classification: newDoc.classification,
        review_date: newDoc.reviewDate || null,
        linked_standards: newDoc.linkedStandards,
        strategic_goals: newDoc.strategicGoals ? newDoc.strategicGoals.split(",").map(s => s.trim()).filter(Boolean) : [],
        security_checks: newDoc.securityChecks,
        replaces_doc_id: newDoc.replacesDocId || null,
        org_id: profile?.orgId || null,
        status: "Active",
      });

      if (error) throw error;

      // If replacing a doc, archive the old one
      if (newDoc.replacesDocId) {
        await (supabase as any).from("governance_documents")
          .update({ status: "Archived" })
          .eq("id", newDoc.replacesDocId);
      }

      toast({ title: "Document created", description: `${newDoc.title} has been added to the governance portfolio.` });
      queryClient.invalidateQueries({ queryKey: ["governance_documents"] });
      setAddOpen(false);
      setAddStep(1);
      setNewDoc({ title: "", owner: "", unit: "", domain: "", category: "", classification: "Operational", reviewDate: "", linkedStandards: [], strategicGoals: "", securityChecks: {}, replacesDocId: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  if (docsLoading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading governance data…</p></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Governance Portfolio</h1>
          <p className="text-sm text-muted-foreground">All registered governance documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Document</Button>
        </div>
      </div>

      {/* Summary cards — reduced to 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div><p className="text-2xl font-bold text-foreground">{docs.length}</p><p className="text-xs text-muted-foreground">Total Documents</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <AlertCircle className="h-7 w-7 text-destructive" />
          <div><p className="text-2xl font-bold text-destructive">{overdue}</p><p className="text-xs text-muted-foreground">Overdue for Review</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-destructive" />
          <div><p className="text-2xl font-bold text-destructive">{activeContradictions}</p><p className="text-xs text-muted-foreground">Active Contradictions</p></div>
        </CardContent></Card>
      </div>

      {/* Compact views + filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {savedViews.map(v => (
          <Badge key={v.value} variant={savedView === v.value ? "default" : "outline"}
            className="text-xs cursor-pointer hover:bg-muted" onClick={() => setSavedView(v.value)}>
            {v.label}
          </Badge>
        ))}
        <span className="mx-1 text-muted-foreground/30">|</span>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Units" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Units</SelectItem>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Operational">Operational</SelectItem><SelectItem value="Development/Innovation">Dev/Innovation</SelectItem></SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="overdue">Overdue</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent>
        </Select>
        {(search || unitFilter !== "all" || classFilter !== "all" || statusFilter !== "all" || domainFilter !== "all" || savedView !== "all") && (
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => { setSearch(""); setUnitFilter("all"); setClassFilter("all"); setStatusFilter("all"); setDomainFilter("all"); setSavedView("all"); }}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>Document <SortIcon field="title" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("unit")}>Unit <SortIcon field="unit" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("classification")}>Type <SortIcon field="classification" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("owner")}>Owner <SortIcon field="owner" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("reviewDate")}>Review <SortIcon field="reviewDate" /></TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(doc => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDoc(doc)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{doc.unit}</TableCell>
                  <TableCell>
                    <Badge variant={doc.classification === "Operational" ? "secondary" : "default"} className={doc.classification === "Development/Innovation" ? "bg-primary/10 text-primary border-primary/20" : ""}>
                      {doc.classification === "Development/Innovation" ? "Dev/Inn" : "Ops"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.owner ? (
                      <p className="text-sm text-foreground">{doc.owner}</p>
                    ) : (
                      <Badge className="bg-warning/10 text-warning border-warning/20 text-xs"><UserX className="h-3 w-3 mr-1" />No owner</Badge>
                    )}
                  </TableCell>
                  <TableCell>{reviewBadge(doc.reviewDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {docContradictions(doc.id).length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {doc.escalatedToBoard && <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">Board</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No documents match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Document Dialog — Multi-step */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setAddStep(1); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Governance Document</DialogTitle>
            <DialogDescription>Step {addStep} of 4</DialogDescription>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="Document title" /></div>
              <div><Label>Owner *</Label><Input value={newDoc.owner} onChange={e => setNewDoc({ ...newDoc, owner: e.target.value })} placeholder="Document owner name" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Unit</Label>
                  <Select value={newDoc.unit} onValueChange={v => setNewDoc({ ...newDoc, unit: v })}>
                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Domain</Label>
                  <Select value={newDoc.domain} onValueChange={v => setNewDoc({ ...newDoc, domain: v })}>
                    <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                    <SelectContent>{domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Category</Label>
                  <Select value={newDoc.category} onValueChange={v => setNewDoc({ ...newDoc, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Classification</Label>
                  <Select value={newDoc.classification} onValueChange={v => setNewDoc({ ...newDoc, classification: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Development/Innovation">Development/Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-3">
              <div><Label>Review Date</Label><Input type="date" value={newDoc.reviewDate} onChange={e => setNewDoc({ ...newDoc, reviewDate: e.target.value })} /></div>
              <div><Label>Strategic Goals (comma-separated)</Label><Input value={newDoc.strategicGoals} onChange={e => setNewDoc({ ...newDoc, strategicGoals: e.target.value })} placeholder="e.g. Digital First, Open Data" /></div>
              <div>
                <Label>Security Design Principles</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(securityCheckLabels).map(([k, label]) => (
                    <div key={k} className="flex items-center gap-2">
                      <Checkbox checked={!!newDoc.securityChecks[k]} onCheckedChange={c => { setNewDoc({ ...newDoc, securityChecks: { ...newDoc.securityChecks, [k]: !!c } }); setAutoChecked(false); }} />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                {autoChecked && (
                  <p className="text-xs text-muted-foreground italic mt-2">Some boxes were pre-selected based on your category. Review and adjust if needed.</p>
                )}
                {accessibilityHelper && (
                  <p className="text-xs text-muted-foreground mt-2">ℹ️ Ensure WCAG 2.1 AA compliance is documented in the description.</p>
                )}
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground mb-1">1 in, 1 out — Document Replacement</p>
                <p className="text-xs text-muted-foreground mb-3">If this document replaces an existing one, select it below. The old document will be archived automatically.</p>
                <Select value={newDoc.replacesDocId || "none"} onValueChange={v => setNewDoc({ ...newDoc, replacesDocId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="No replacement (new document)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No replacement</SelectItem>
                    {docs.filter(d => d.status === "Active").map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.title} ({d.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newDoc.replacesDocId && (
                  <div className="mt-2 p-2 rounded border bg-muted/50 text-xs">
                    <p className="font-medium text-destructive">⚠ Will archive: {docs.find(d => d.id === newDoc.replacesDocId)?.title}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {addStep === 4 && (
            <div className="space-y-3 text-sm">
              <p className="font-semibold">Review & Submit</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{newDoc.title}</span></div>
                <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{newDoc.owner}</span></div>
                <div><span className="text-muted-foreground">Unit:</span> <span className="font-medium">{newDoc.unit || "—"}</span></div>
                <div><span className="text-muted-foreground">Domain:</span> <span className="font-medium">{newDoc.domain || "—"}</span></div>
                <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{newDoc.category || "—"}</span></div>
                <div><span className="text-muted-foreground">Classification:</span> <span className="font-medium">{newDoc.classification}</span></div>
                <div><span className="text-muted-foreground">Review Date:</span> <span className="font-medium">{newDoc.reviewDate || "—"}</span></div>
                <div><span className="text-muted-foreground">Replaces:</span> <span className="font-medium">{newDoc.replacesDocId ? docs.find(d => d.id === newDoc.replacesDocId)?.title : "None"}</span></div>
              </div>
              {newDoc.replacesDocId && (
                <div className="rounded border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
                  The document "{docs.find(d => d.id === newDoc.replacesDocId)?.title}" will be archived (1 in, 1 out).
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {addStep > 1 && <Button variant="outline" size="sm" onClick={() => setAddStep(s => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>}
            </div>
            <div>
              {addStep < 4 ? (
                <Button size="sm" onClick={() => setAddStep(s => s + 1)} disabled={addStep === 1 && (!newDoc.title || !newDoc.owner)}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmitDoc} disabled={addLoading}>
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  Create Document
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Detail Sheet */}
      <Sheet open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedDoc && (() => {
            const linkedSystems = getLinkedSystems(selectedDoc);
            const linkedRisks = getLinkedRisks(selectedDoc);
            const docContra = docContradictions(selectedDoc.id);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="text-lg">{selectedDoc.title}</SheetTitle>
                  <SheetDescription>{selectedDoc.id} · {selectedDoc.domain}</SheetDescription>
                </SheetHeader>

                {/* Summary / Conclusion card */}
                <div className="mt-4 rounded-lg border bg-secondary/50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDoc.classification === "Operational"
                      ? `This operational governance document establishes rules and procedures for ${selectedDoc.category?.toLowerCase() || "municipal operations"} within the ${selectedDoc.domain || "general"} domain. `
                      : `This development/innovation document guides strategic initiatives in ${selectedDoc.category?.toLowerCase() || "digital development"} for ${selectedDoc.domain || "the municipality"}. `}
                    {selectedDoc.owner
                      ? `It is owned by ${selectedDoc.owner}${selectedDoc.ownerTitle ? ` (${selectedDoc.ownerTitle})` : ""} in the ${selectedDoc.unit || "unassigned"} unit.`
                      : "⚠ This document currently has no assigned owner."}
                    {selectedDoc.reviewDate && getReviewStatus(selectedDoc.reviewDate) === "overdue"
                      ? ` Review is overdue by ${Math.abs(getDaysUntilReview(selectedDoc.reviewDate))} days.`
                      : selectedDoc.reviewDate && getReviewStatus(selectedDoc.reviewDate) === "urgent"
                        ? ` Review is due within ${getDaysUntilReview(selectedDoc.reviewDate)} days.`
                        : ""}
                    {docContra.length > 0 ? ` There ${docContra.length === 1 ? "is" : "are"} ${docContra.length} active contradiction${docContra.length > 1 ? "s" : ""} that require${docContra.length === 1 ? "s" : ""} resolution.` : ""}
                  </p>
                </div>

                <div className="mt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner</p>
                      {selectedDoc.owner ? (
                        <><p className="font-medium text-foreground">{selectedDoc.owner}</p>{selectedDoc.ownerTitle && <p className="text-xs text-muted-foreground">{selectedDoc.ownerTitle}</p>}</>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20"><UserX className="h-3 w-3 mr-1" />Orphaned</Badge>
                      )}
                    </div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium text-foreground">{selectedDoc.unit || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Domain</p><p className="font-medium text-foreground">{selectedDoc.domain}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium text-foreground">{selectedDoc.category}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Classification</p><Badge variant="secondary">{selectedDoc.classification}</Badge></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><Badge variant="secondary">{selectedDoc.status}</Badge></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><div className="flex items-center gap-2 mt-1">{reviewBadge(selectedDoc.reviewDate)}<span className="text-xs text-muted-foreground">{selectedDoc.reviewDate || "Not set"}</span></div></div>
                  </div>

                  {docContra.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-destructive flex items-center gap-1 text-sm"><AlertTriangle className="h-4 w-4" /> Contradictions ({docContra.length})</p>
                      {docContra.map(c => (
                        <div key={c.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                          <p className="text-sm text-foreground">{c.description}</p>
                          {c.ruleConflict && <div><p className="text-xs font-semibold text-destructive">Rule Conflict</p><p className="text-xs text-muted-foreground">{c.ruleConflict}</p></div>}
                          {c.whyMatters && <div><p className="text-xs font-semibold text-destructive">Why This Matters</p><p className="text-xs text-muted-foreground">{c.whyMatters}</p></div>}
                          {c.reviewNext && <div><p className="text-xs font-semibold text-primary">Recommended Next Steps</p><p className="text-xs text-muted-foreground">{c.reviewNext}</p></div>}
                          <Badge variant="secondary" className="text-[10px]">{c.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-foreground mb-2">Security Design Principles</p>
                    {Object.entries(securityCheckLabels).map(([k, label]) => (
                      <div key={k} className="flex items-center gap-2 py-0.5">
                        {selectedDoc.securityChecks[k] ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>

                  {selectedDoc.linkedStandards.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Linked Standards</p>
                      <div className="flex flex-wrap gap-1">{selectedDoc.linkedStandards.map(id => {
                        const s = standards.find(x => x.id === id);
                        return s ? <Badge key={id} variant="outline" className="text-xs">{s.name}</Badge> : null;
                      })}</div>
                    </div>
                  )}

                  {selectedDoc.strategicGoals.length > 0 && (
                    <div><p className="font-semibold text-foreground mb-1">Strategic Goals</p><div className="flex flex-wrap gap-1">{selectedDoc.strategicGoals.map(g => <Badge key={g} className="bg-primary/10 text-primary border-primary/20 text-xs">{g}</Badge>)}</div></div>
                  )}

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
