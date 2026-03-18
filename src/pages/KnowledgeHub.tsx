import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Lightbulb, FlaskConical, Wrench, Plus, CheckCircle2, Eye, Link2, Search, RotateCcw, Zap, Timer, Archive, ArrowUp, RotateCw, XCircle, ChevronDown, ChevronUp, Building2, Mail, ArrowRight, Trash2, Inbox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useKnowledgeIdeas, useKnowledgeExperiments, usePublishedTools,
  dbPublishedToolToPlatform, type PublishedTool,
} from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type IdeaStatus = "awaiting-review" | "under-experiment" | "published" | "standard-process" | "closed";
type Classification = "maintenance" | "efficiency" | "innovation" | "transformation";

const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
  "awaiting-review": { label: "Awaiting Review", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  "under-experiment": { label: "Under Experiment", color: "bg-orange-100 text-orange-800 border-orange-300" },
  "published": { label: "Published", color: "bg-green-100 text-green-800 border-green-300" },
  "standard-process": { label: "Standard Process", color: "bg-blue-100 text-blue-800 border-blue-300" },
  "closed": { label: "Closed", color: "bg-red-100 text-red-800 border-red-300" },
};

const classificationConfig: Record<Classification, { label: string; color: string }> = {
  maintenance: { label: "Maintenance", color: "bg-muted text-muted-foreground" },
  efficiency: { label: "Efficiency", color: "bg-info/10 text-info border-info/20" },
  innovation: { label: "Innovation", color: "bg-primary/10 text-primary border-primary/20" },
  transformation: { label: "Transformation", color: "bg-success/10 text-success border-success/20" },
};

const departments = [
  "Municipal Executive Office", "Social Services", "Education & Schools",
  "Urban Planning & Environment", "IT & Digitalisation", "Culture & Leisure", "HR",
];

const outcomeIcons: Record<string, any> = {
  stop: { icon: XCircle, label: "Archived", color: "bg-red-100 text-red-800 border-red-300" },
  iterate: { icon: RotateCw, label: "Re-entering Fast Track", color: "bg-orange-100 text-orange-800 border-orange-300" },
  scale: { icon: ArrowUp, label: "Escalated to Normal Track", color: "bg-blue-100 text-blue-800 border-blue-300" },
};

export default function KnowledgeHub() {
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();
  const { data: rawIdeas, isLoading: ideasLoading } = useKnowledgeIdeas();
  const { data: rawExperiments } = useKnowledgeExperiments();
  const { data: rawTools } = usePublishedTools();

  const ideas = rawIdeas || [];
  const experiments = rawExperiments || [];
  const tools: PublishedTool[] = useMemo(() => (rawTools || []).map(dbPublishedToolToPlatform), [rawTools]);

  const isCto = role === "cto";

  // Fast Track pending count
  const pendingFastTrack = useMemo(() =>
    ideas.filter((i: any) => i.fast_track && i.approval_status === "pending"),
    [ideas]
  );

  const [section, setSection] = useState<"ideas" | "experiments" | "tools" | "fasttrack">(isCto ? "fasttrack" : "ideas");
  const [showForm, setShowForm] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formName, setFormName] = useState(profile?.displayName || "");
  const [formEmail, setFormEmail] = useState(profile?.email || "");
  const [formClassification, setFormClassification] = useState<Classification | "">("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const [ftQ1, setFtQ1] = useState(false);
  const [ftQ2, setFtQ2] = useState(false);
  const [ftQ3, setFtQ3] = useState(false);

  // Fast Track inbox state
  const [confirmingAction, setConfirmingAction] = useState<{ id: string; type: "approve" | "deny" } | null>(null);
  const [actionComment, setActionComment] = useState("");

  const canDelete = role === "cto" || role === "cfo" || role === "coo";

  const filteredIdeas = useMemo(() => {
    let data = [...ideas];
    if (classFilter !== "all") data = data.filter(i => i.classification === classFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(i => i.title.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }
    return data;
  }, [ideas, classFilter, searchText]);

  const ftEligible = ftQ1 && ftQ2 && ftQ3;

  const resetForm = () => {
    setFormTitle(""); setFormDesc(""); setFormDept(""); setFormClassification("");
    setFtQ1(false); setFtQ2(false); setFtQ3(false);
    setWizardStep(1);
    setShowForm(false);
  };

  const submitIdea = async () => {
    if (!formTitle || !formDesc || !formDept || !formClassification) return;
    await (supabase as any).from("knowledge_ideas").insert({
      title: formTitle,
      description: formDesc,
      department: formDept,
      contact_name: formName,
      contact_email: formEmail,
      classification: formClassification as any,
      org_id: profile?.orgId || "org-eskilstuna",
      status: "awaiting-review",
      fast_track: ftEligible,
      fast_track_answers: ftEligible ? { looselyCoupled: ftQ1, underCost: ftQ2, reversible: ftQ3 } : {},
      approval_status: ftEligible ? "pending" : "pending",
    });
    queryClient.invalidateQueries({ queryKey: ["knowledge_ideas"] });
    resetForm();
  };

  const deleteIdea = async (ideaId: string) => {
    await (supabase as any).from("knowledge_ideas").delete().eq("id", ideaId);
    queryClient.invalidateQueries({ queryKey: ["knowledge_ideas"] });
    toast({ title: "Idea deleted." });
  };

  const handleFastTrackAction = async (ideaId: string, action: "approve" | "deny") => {
    const updates = action === "approve"
      ? { approval_status: "approved", approved_by: "Elena Vasquez", approved_at: new Date().toISOString(), approval_comment: actionComment || null, status: "under-experiment" }
      : { approval_status: "denied", approved_by: "Elena Vasquez", approved_at: new Date().toISOString(), approval_comment: actionComment || null, status: "standard-process" };

    await (supabase as any).from("knowledge_ideas").update(updates).eq("id", ideaId);
    queryClient.invalidateQueries({ queryKey: ["knowledge_ideas"] });
    setConfirmingAction(null);
    setActionComment("");
    toast({
      title: action === "approve" ? "✅ Approved — idea moves to Fast Track experiment track." : "Idea redirected to Normal Track.",
    });
  };

  function getSandboxRemaining(exp: any) {
    if (!exp.sandbox_start_date) return null;
    const start = new Date(exp.sandbox_start_date);
    const endDate = new Date(start.getTime() + (exp.sandbox_weeks || 10) * 7 * 24 * 60 * 60 * 1000);
    const remaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { remaining: Math.max(0, remaining), total: (exp.sandbox_weeks || 10) * 7, expired: remaining <= 0 };
  }

  const getLinkedExperiment = (tool: PublishedTool) => {
    if (tool.linkedExperimentId) return experiments.find((e: any) => e.id === tool.linkedExperimentId);
    return null;
  };

  if (ideasLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading…</p></div>;

  const tabs = [
    ...(isCto ? [{ key: "fasttrack" as const, label: "⚡ Fast Track Inbox", icon: Inbox, count: pendingFastTrack.length, showDot: pendingFastTrack.length > 0 }] : []),
    { key: "ideas" as const, label: "Ideas", icon: Lightbulb, count: ideas.length },
    { key: "experiments" as const, label: "Experiments", icon: FlaskConical, count: experiments.length },
    { key: "tools" as const, label: "Published Tools", icon: Wrench, count: tools.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Hub</h1>
          <p className="text-sm text-muted-foreground">Ideas, experiments, and institutional learning</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setSection(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              section === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
            {t.key === "fasttrack" && (t as any).showDot ? (
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="text-[10px] font-bold text-destructive">{t.count}</span>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </span>
            ) : (
              <Badge variant="secondary" className="text-[10px]">{t.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* FAST TRACK INBOX */}
      {section === "fasttrack" && isCto && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Fast Track Inbox</h2>
            <p className="text-sm text-muted-foreground">Review pending Fast Track submissions. Only ideas meeting all three criteria qualify.</p>
          </div>

          {pendingFastTrack.length > 0 ? (
            <>
              <Badge className="bg-warning/10 text-warning border-warning/30">{pendingFastTrack.length} awaiting review</Badge>
              <div className="space-y-4">
                {pendingFastTrack.sort((a: any, b: any) => (a.date_submitted || "").localeCompare(b.date_submitted || "")).map((idea: any) => {
                  const answers = (idea.fast_track_answers || {}) as any;
                  const allMet = answers.looselyCoupled && answers.underCost && answers.reversible;
                  const isConfirming = confirmingAction?.id === idea.id;

                  return (
                    <motion.div key={idea.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <Card className="border-l-4 border-l-warning">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{idea.title}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">{idea.department}</Badge>
                                <span className="text-xs text-muted-foreground">{idea.date_submitted}</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">{idea.contact_name}</span>
                                {idea.contact_email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{idea.contact_email}</span>}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>

                          {/* Criteria checklist */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              {answers.looselyCoupled ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                              <span>Loosely coupled — can be built independently</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {answers.underCost ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                              <span>Under cost threshold — Estimated: {answers.estimatedCost || "?"} kSEK</span>
                            </div>
                            {answers.costNote && <p className="text-xs text-muted-foreground ml-6">{answers.costNote}</p>}
                            <div className="flex items-center gap-2 text-sm">
                              {answers.reversible ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                              <span>Reversible — can be stopped without lasting impact</span>
                            </div>
                          </div>

                          {/* Qualification banner */}
                          {allMet ? (
                            <div className="rounded-lg bg-success/10 border border-success/20 p-2 text-sm text-success font-medium">✅ Qualifies for Fast Track</div>
                          ) : (
                            <div className="rounded-lg bg-warning/10 border border-warning/20 p-2 text-sm text-warning font-medium">⚠ Does not meet Fast Track criteria — will be redirected to Normal Track</div>
                          )}

                          {/* Action buttons */}
                          {!isConfirming && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setConfirmingAction({ id: idea.id, type: "deny" }); setActionComment(""); }}>
                                Deny
                              </Button>
                              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => { setConfirmingAction({ id: idea.id, type: "approve" }); setActionComment(""); }}>
                                Approve
                              </Button>
                            </div>
                          )}

                          {/* Inline confirmation */}
                          {isConfirming && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t pt-3 space-y-2">
                              <Textarea
                                value={actionComment}
                                onChange={e => setActionComment(e.target.value)}
                                placeholder={confirmingAction?.type === "approve" ? "Approved — meets all three criteria. Sandbox starts Monday." : "Explain why this is being denied or redirected."}
                                className="text-sm"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setConfirmingAction(null)}>Cancel</button>
                                <Button size="sm" variant={confirmingAction?.type === "deny" ? "destructive" : "default"}
                                  className={confirmingAction?.type === "approve" ? "bg-success hover:bg-success/90" : ""}
                                  onClick={() => handleFastTrackAction(idea.id, confirmingAction!.type)}>
                                  {confirmingAction?.type === "approve" ? "Confirm Approve" : "Confirm Deny"}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mb-3" />
              <p className="text-lg font-medium text-foreground">All Fast Track ideas reviewed ✓</p>
              <p className="text-sm text-muted-foreground">No pending submissions.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* IDEAS */}
      {section === "ideas" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Submit Idea</Button>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ideas..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9" />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Classification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {Object.entries(classificationConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {(searchText || classFilter !== "all") && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => { setSearchText(""); setClassFilter("all"); }}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>

          {filteredIdeas.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No ideas match your filters.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {filteredIdeas.map(idea => (
                  <div key={idea.id} className="group relative cursor-pointer hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2" onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}>
                      <div className="min-w-0 flex items-center gap-2">
                        {expandedIdea === idea.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm text-foreground">{idea.title}</p>
                            {idea.fast_track ? (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">⚡ Fast Track</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs text-muted-foreground">Normal Track</Badge>
                            )}
                            {idea.fast_track && idea.approval_status === "pending" && (
                              <Badge className="bg-warning/10 text-warning border-warning/30 text-[10px]">Pending Fast Track review</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{idea.contact_name} · {idea.department} · {idea.date_submitted}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {idea.classification && (
                          <Badge variant="outline" className={`text-xs ${classificationConfig[idea.classification as Classification]?.color || ""}`}>
                            {classificationConfig[idea.classification as Classification]?.label || idea.classification}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${statusConfig[idea.status as IdeaStatus]?.color || ""}`}>
                          {statusConfig[idea.status as IdeaStatus]?.label || idea.status}
                        </Badge>
                      </div>
                    </div>
                    {/* Delete button */}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10" onClick={e => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete idea?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone. The idea and any linked experiment references will be removed.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteIdea(idea.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {expandedIdea === idea.id && (
                      <div className="px-4 pb-4 pt-0 space-y-2 border-t ml-6">
                        <p className="text-sm text-muted-foreground mt-2">{idea.description || "No description provided."}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Contact: {idea.contact_name}</span>
                          {idea.contact_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{idea.contact_email}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* EXPERIMENTS */}
      {section === "experiments" && (
        <div className="space-y-4">
          {experiments.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No experiments yet.</CardContent></Card>
          ) : experiments.map((exp: any) => {
            const sandbox = exp.fast_track ? getSandboxRemaining(exp) : null;
            const outcome = outcomeIcons[exp.outcome_routing || exp.recommendation];
            const OutcomeIcon = outcome?.icon || Archive;
            return (
              <Card key={exp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{exp.title}</CardTitle>
                      <CardDescription>{exp.owner} · {exp.department}</CardDescription>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {exp.fast_track && <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20"><Zap className="h-3 w-3 mr-1" />Fast Track</Badge>}
                      {exp.classification && (
                        <Badge variant="outline" className={`text-xs ${classificationConfig[exp.classification as Classification]?.color || ""}`}>
                          {classificationConfig[exp.classification as Classification]?.label || exp.classification}
                        </Badge>
                      )}
                      {exp.completed && outcome && <Badge variant="outline" className={`text-xs ${outcome.color}`}><OutcomeIcon className="h-3 w-3 mr-1" />{outcome.label}</Badge>}
                      <Badge variant="outline" className={exp.completed ? "bg-green-100 text-green-800 border-green-300" : "bg-orange-100 text-orange-800 border-orange-300"}>
                        {exp.completed ? "Completed" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sandbox && !exp.completed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground"><Timer className="h-3 w-3" /> Sandbox countdown</span>
                        <span className="font-medium">{sandbox.remaining} days remaining</span>
                      </div>
                      <Progress value={((sandbox.total - sandbox.remaining) / sandbox.total) * 100} className="h-2" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{exp.progress_percent}%</span>
                    </div>
                    <Progress value={exp.progress_percent || 0} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(exp.tags || []).map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {exp.isolated && <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Isolated</span>}
                    {exp.no_production_access && <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> No production access</span>}
                    {exp.mock_data_only && <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Mock data only</span>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}>
                    <Eye className="h-3 w-3 mr-1" /> {expandedExp === exp.id ? "Hide" : "Details & Learning Log"}
                  </Button>
                  {expandedExp === exp.id && (
                    <div className="space-y-3 border-t pt-3">
                      <div><Label className="text-xs text-muted-foreground">Hypothesis</Label><p className="text-sm mt-1">{exp.hypothesis}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Observations</Label><p className="text-sm mt-1">{exp.observations}</p></div>
                      {exp.completed && (
                        <>
                          {exp.result && <div><Label className="text-xs text-muted-foreground">What worked</Label><p className="text-sm mt-1">{exp.result}</p></div>}
                          {exp.divergence && <div><Label className="text-xs text-muted-foreground">What didn't work</Label><p className="text-sm mt-1">{exp.divergence}</p></div>}
                          {exp.recommendation && <div><Label className="text-xs text-muted-foreground">Recommendation</Label><Badge className="ml-1 bg-green-100 text-green-800 border-green-300">{exp.recommendation}</Badge></div>}
                        </>
                      )}
                      {exp.apis_used && exp.apis_used.length > 0 && (
                        <div><Label className="text-xs text-muted-foreground">APIs Used</Label>
                          <div className="flex flex-wrap gap-1 mt-1">{exp.apis_used.map((a: string) => <Badge key={a} variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => navigate(`/api?api=${a}`)}><Link2 className="h-3 w-3 mr-1" />{a}</Badge>)}</div>
                        </div>
                      )}
                      {exp.fast_track && (
                        <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
                          <p className="font-medium text-foreground">Fast Track Info</p>
                          <p className="text-muted-foreground">Approval: {exp.approval_status}{exp.approver ? ` by ${exp.approver}` : ""}</p>
                          {exp.exit_log_approved && <p className="text-success">✓ Learning log published</p>}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* PUBLISHED TOOLS */}
      {section === "tools" && (
        <div className="space-y-4">
          {tools.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No published tools yet.</CardContent></Card>
          ) : tools.map(tool => {
            const linkedExp = getLinkedExperiment(tool);
            const isExpanded = expandedTool === tool.id;
            return (
              <Card key={tool.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setExpandedTool(isExpanded ? null : tool.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <CardDescription>{tool.department}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {tool.municipalityName && (
                        <Badge variant="outline" className="text-xs"><Building2 className="h-3 w-3 mr-1" />{tool.municipalityName}</Badge>
                      )}
                      {tool.classification && (
                        <Badge variant="outline" className={`text-xs ${classificationConfig[tool.classification as Classification]?.color || ""}`}>
                          {classificationConfig[tool.classification as Classification]?.label || tool.classification}
                        </Badge>
                      )}
                      <Badge variant="outline" className={tool.status === "Active" ? "bg-green-100 text-green-800 border-green-300" : tool.status === "Active (Beta)" ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-muted text-muted-foreground"}>
                        {tool.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  {tool.apis && tool.apis.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tool.apis.map((a: string) => (
                        <Badge key={a} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); navigate(`/api?api=${a}`); }}>
                          <Link2 className="h-3 w-3 mr-1" />{a}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {isExpanded && (
                    <div className="border-t pt-3 space-y-3">
                      {tool.municipalityName && (
                        <div className="flex items-center gap-2 text-xs">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Developed by:</span>
                          <span>{tool.municipalityName}</span>
                          {tool.contactEmail && <a href={`mailto:${tool.contactEmail}`} className="text-primary hover:underline flex items-center gap-1"><Mail className="h-3 w-3" />{tool.contactEmail}</a>}
                        </div>
                      )}
                      {linkedExp && (
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-medium text-foreground">Learning Log</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div><p className="text-muted-foreground">Hypothesis</p><p className="mt-0.5">{linkedExp.hypothesis}</p></div>
                            <div><p className="text-muted-foreground">Result</p><p className="mt-0.5">{linkedExp.result || "—"}</p></div>
                            <div><p className="text-muted-foreground">What didn't work</p><p className="mt-0.5">{linkedExp.divergence || "—"}</p></div>
                            <div><p className="text-muted-foreground">Recommendation</p><p className="mt-0.5">{linkedExp.recommendation || "—"}</p></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Idea Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); else setShowForm(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{wizardStep === 1 ? "Submit New Idea — Basic Info" : "Fast Track Assessment"}</DialogTitle>
            <DialogDescription>
              {wizardStep === 1 ? "Describe your idea for a digital tool, improvement, or new way of working." : "Answer three questions to determine approval track."}
            </DialogDescription>
          </DialogHeader>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Short title for your idea" /></div>
              <div><Label>Description *</Label><Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What problem does this solve?" rows={3} /></div>
              <div><Label>Department *</Label>
                <Select value={formDept} onValueChange={setFormDept}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Classification *</Label>
                <Select value={formClassification} onValueChange={v => setFormClassification(v as Classification)}>
                  <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(classificationConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Your Name</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
                <div><Label>Email</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">If all three conditions are met, your idea qualifies for <strong>Fast Track</strong> (reviewed within 48h). Otherwise it follows the normal approval track.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Is the initiative loosely coupled?</p><p className="text-xs text-muted-foreground">Can be developed independently from core systems</p></div>
                  <Switch checked={ftQ1} onCheckedChange={setFtQ1} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Below cost threshold?</p><p className="text-xs text-muted-foreground">Under 200 kSEK (peer avg threshold: 180 kSEK)</p></div>
                  <Switch checked={ftQ2} onCheckedChange={setFtQ2} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Is it reversible?</p><p className="text-xs text-muted-foreground">Can be stopped or rolled back without lasting impact</p></div>
                  <Switch checked={ftQ3} onCheckedChange={setFtQ3} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ftEligible ? (
                  <Badge className="bg-success/10 text-success border-success/30"><Zap className="h-3 w-3 mr-1" /> Fast Track — reviewed within 48h</Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning border-warning/30">Normal Track — requires committee review</Badge>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {wizardStep === 2 && (
              <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
            )}
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            {wizardStep === 1 ? (
              <Button onClick={() => setWizardStep(2)} disabled={!formTitle || !formDesc || !formDept || !formClassification}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submitIdea}>
                Submit {ftEligible ? "(Fast Track)" : "(Normal Track)"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
