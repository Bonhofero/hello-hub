import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


// Systems
export function useSystems() {
  return useQuery({
    queryKey: ["systems"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("systems").select("*").order("name");
      if (error) { console.warn("systems query failed:", error.message); return []; }
      return data;
    },
  });
}

// Risks
export function useRisks() {
  return useQuery({
    queryKey: ["risks"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("risks").select("*").order("title");
      if (error) { console.warn("risks query failed:", error.message); return []; }
      return data;
    },
  });
}

// Risk Score History
export function useRiskScoreHistory(riskId: string) {
  return useQuery({
    queryKey: ["risk_score_history", riskId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("risk_score_history")
        .select("*")
        .eq("risk_id", riskId)
        .order("recorded_at", { ascending: true });
      if (error) { console.warn("risk_score_history query failed:", error.message); return []; }
      return data;
    },
    enabled: !!riskId,
  });
}

// APIs
export function useApis() {
  return useQuery({
    queryKey: ["apis"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("apis").select("*").order("name");
      if (error) { console.warn("apis query failed:", error.message); return []; }
      return data;
    },
  });
}

// Governance Documents
export function useGovernanceDocs() {
  return useQuery({
    queryKey: ["governance_documents"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("governance_documents").select("*").order("title");
      if (error) { console.warn("governance_documents query failed:", error.message); return []; }
      return data;
    },
  });
}

// Governance Contradictions
export function useContradictions() {
  return useQuery({
    queryKey: ["governance_contradictions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("governance_contradictions").select("*");
      if (error) { console.warn("governance_contradictions query failed:", error.message); return []; }
      return data;
    },
  });
}

// Governance Standards
export function useGovernanceStandards() {
  return useQuery({
    queryKey: ["governance_standards"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("governance_standards").select("*").order("name");
      if (error) { console.warn("governance_standards query failed:", error.message); return []; }
      return data;
    },
  });
}

// Vendors
export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vendors").select("*").order("name");
      if (error) { console.warn("vendors query failed:", error.message); return []; }
      return data;
    },
  });
}

// Contracts
export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("contracts").select("*").order("title");
      if (error) { console.warn("contracts query failed:", error.message); return []; }
      return data;
    },
  });
}

// Knowledge Ideas
export function useKnowledgeIdeas() {
  return useQuery({
    queryKey: ["knowledge_ideas"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("knowledge_ideas").select("*").order("created_at", { ascending: false });
      if (error) { console.warn("knowledge_ideas query failed:", error.message); return []; }
      return data;
    },
  });
}

// Knowledge Experiments
export function useKnowledgeExperiments() {
  return useQuery({
    queryKey: ["knowledge_experiments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("knowledge_experiments").select("*").order("created_at", { ascending: false });
      if (error) { console.warn("knowledge_experiments query failed:", error.message); return []; }
      return data;
    },
  });
}

// Knowledge Published Tools
export function usePublishedTools() {
  return useQuery({
    queryKey: ["knowledge_published_tools"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("knowledge_published_tools").select("*").order("name");
      if (error) { console.warn("knowledge_published_tools query failed:", error.message); return []; }
      return data;
    },
  });
}

// KPI Values
export function useKpiValues(role?: string) {
  return useQuery({
    queryKey: ["kpi_values", role],
    queryFn: async () => {
      let query = (supabase as any).from("kpi_values").select("*");
      if (role) query = query.eq("role", role as any);
      const { data, error } = await query;
      if (error) { console.warn("kpi_values query failed:", error.message); return []; }
      return data;
    },
  });
}

// Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("organizations").select("*").order("name");
      if (error) { console.warn("organizations query failed:", error.message); return []; }
      return data;
    },
  });
}

// Opportunity Cost Items
export function useOpportunityCostItems() {
  return useQuery({
    queryKey: ["opportunity_cost_items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("opportunity_cost_items").select("*").order("your_cost", { ascending: false });
      if (error) { console.warn("opportunity_cost_items query failed:", error.message); return []; }
      return data;
    },
  });
}

// ─── Helper types and conversion functions ────────────────────────────────────

export interface GovDoc {
  id: string;
  title: string;
  owner: string;
  ownerTitle: string;
  unit: string;
  classification: "Operational" | "Development/Innovation";
  category: string;
  reviewDate: string;
  status: "Active" | "Under Review" | "Draft" | "Archived";
  replacesDocId: string | null;
  orgId: string;
  createdDate: string;
  securityChecks: Record<string, boolean>;
  linkedStandards: string[];
  linkedCoreSystems: string[];
  escalatedToBoard: boolean;
  strategicGoals: string[];
  keywords: string[];
  domain: string;
  hasOwner: boolean;
}

export interface GovContradiction {
  id: string;
  docAId: string;
  docBId: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  resolved: boolean;
  explanation: string;
  ruleConflict: string;
  whyMatters: string;
  reviewNext: string;
}

export interface GovStandard {
  id: string;
  name: string;
  description: string;
  status: string;
  linkedDocIds: string[];
}

export interface PlatformSystem {
  id: string;
  name: string;
  type: string;
  owner: string;
  ownerTitle: string;
  department: string;
  orgId: string;
  domain: string;
  lifecycle: string;
  criticality: string;
  annualCost: number;
  maintenanceCost: number;
  developmentCost: number;
  vendor: string;
  vendorId: string;
  contractEnd: string;
  lockInRisk: string;
  apiReusePotential: string;
  replacementPriority: string;
  linkedApis: string[];
  dependencies: string[];
  downstreamServices: string[];
  openRisks: string[];
  standardsUsed: string[];
  linkedGovDocs: string[];
  lastReviewDate: string;
  description: string;
  x: number;
  y: number;
  visibility: string;
  internetFacing: boolean;
  previousRiskScore?: number;
}

export interface PlatformRisk {
  id: string;
  title: string;
  type: string;
  linkedSystemId: string;
  linkedDependency?: string;
  linkedRiskIds: string[];
  likelihood: number;
  impact: number;
  affectedServices: string[];
  owner: string;
  mitigation: string;
  dueDate: string;
  escalationStatus: string;
  boardVisibility: boolean;
  lastUpdated: string;
  source: string;
  category: string;
  previousScore?: number;
  likelihoodOverride?: number;
  impactOverride?: number;
}

export interface PlatformApi {
  id: string;
  name: string;
  type: "internal" | "partner" | "public";
  linkedSystemId: string;
  protocol: string;
  description: string;
  endpoint: string;
  visibility: string;
  authentication: string;
  version: string;
  rateLimitPerMin: number;
  problemsSolved: string[];
  developerMunicipality?: string;
  developerContact?: string;
}

export interface PeerDetail {
  municipalityAlias: string;
  cost: number;
}

export interface OpportunityCostItem {
  id: string;
  functionName: string;
  linkedApiId: string;
  linkedSystemId?: string;
  yourCost: number;
  peerAverageCost: number;
  peerCount: number;
  potentialSaving: number;
  adopted: boolean;
  peerDetails: PeerDetail[];
}

export interface PublishedTool {
  id: string;
  name: string;
  department: string;
  description: string;
  status: string;
  apis: string[];
  classification: string;
  visibility: string;
  municipalityName?: string;
  contactEmail?: string;
  linkedExperimentId?: string;
}

export function dbGovDocToPlatform(d: any): GovDoc {
  return {
    id: d.id,
    title: d.title,
    owner: d.owner,
    ownerTitle: d.owner_title || "",
    unit: d.unit || "",
    classification: d.classification as "Operational" | "Development/Innovation",
    category: d.category || "",
    reviewDate: d.review_date || "",
    status: d.status as "Active" | "Under Review" | "Draft" | "Archived",
    replacesDocId: d.replaces_doc_id || null,
    orgId: d.org_id || "",
    createdDate: d.created_date || "",
    securityChecks: (d.security_checks as Record<string, boolean>) || {},
    linkedStandards: d.linked_standards || [],
    linkedCoreSystems: d.linked_core_systems || [],
    escalatedToBoard: d.escalated_to_board || false,
    strategicGoals: d.strategic_goals || [],
    keywords: d.keywords || [],
    domain: d.domain || "",
    hasOwner: d.has_owner !== false,
  };
}

export function dbContradictionToPlatform(c: any): GovContradiction {
  return {
    id: c.id,
    docAId: c.doc_a_id || "",
    docBId: c.doc_b_id || "",
    description: c.description,
    severity: c.severity as "High" | "Medium" | "Low",
    resolved: c.resolved || false,
    explanation: c.explanation || "",
    ruleConflict: c.rule_conflict || "",
    whyMatters: c.why_matters || "",
    reviewNext: c.review_next || "",
  };
}

export function dbStandardToPlatform(s: any): GovStandard {
  return {
    id: s.id,
    name: s.name,
    description: s.description || "",
    status: s.status || "Active",
    linkedDocIds: s.linked_doc_ids || [],
  };
}

export function dbSystemToPlatform(s: any): PlatformSystem {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    owner: s.owner,
    ownerTitle: s.owner_title || "",
    department: s.department || "",
    orgId: s.org_id,
    domain: s.domain || "",
    lifecycle: s.lifecycle,
    criticality: s.criticality,
    annualCost: Number(s.annual_cost) || 0,
    maintenanceCost: Number(s.maintenance_cost) || 0,
    developmentCost: Number(s.development_cost) || 0,
    vendor: s.vendor_name || "",
    vendorId: s.vendor_id || "",
    contractEnd: s.contract_end || "",
    lockInRisk: s.lock_in_risk || "medium",
    apiReusePotential: s.api_reuse_potential || "medium",
    replacementPriority: s.replacement_priority || "none",
    linkedApis: [] as string[],
    dependencies: s.dependencies || [],
    downstreamServices: s.downstream_services || [],
    openRisks: [] as string[],
    standardsUsed: s.standards_used || [],
    linkedGovDocs: s.linked_gov_docs || [],
    lastReviewDate: s.last_review_date || "",
    description: s.description || "",
    x: Number(s.x) || 0,
    y: Number(s.y) || 0,
    visibility: s.visibility,
    internetFacing: s.internet_facing || false,
    previousRiskScore: s.previous_risk_score ?? undefined,
  };
}

export function dbRiskToPlatform(r: any): PlatformRisk {
  const linkedRiskIdsRaw = r.linked_risk_ids || "";
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    linkedSystemId: r.linked_system_id || "",
    linkedDependency: r.linked_dependency || undefined,
    linkedRiskIds: linkedRiskIdsRaw ? linkedRiskIdsRaw.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    likelihood: r.likelihood,
    impact: r.impact,
    affectedServices: r.affected_services || [],
    owner: r.owner,
    mitigation: r.mitigation || "",
    dueDate: r.due_date || "",
    escalationStatus: r.escalation_status || "none",
    boardVisibility: r.board_visibility || false,
    lastUpdated: r.last_updated || "",
    source: r.source || "",
    category: r.category || "",
    previousScore: r.previous_score ?? undefined,
    likelihoodOverride: r.likelihood_override ?? undefined,
    impactOverride: r.impact_override ?? undefined,
  };
}

export function dbApiToPlatform(a: any): PlatformApi {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    linkedSystemId: a.linked_system_id || "",
    protocol: a.protocol || "REST",
    description: a.description || "",
    endpoint: a.endpoint || "",
    visibility: a.visibility,
    authentication: a.authentication || "",
    version: a.version || "v1",
    rateLimitPerMin: a.rate_limit_per_min || 100,
    problemsSolved: a.problems_solved || [],
    developerMunicipality: a.developer_municipality || undefined,
    developerContact: a.developer_contact || undefined,
  };
}

export function dbOpportunityCostToPlatform(o: any): OpportunityCostItem {
  return {
    id: o.id,
    functionName: o.function_name,
    linkedApiId: o.linked_api_id || "",
    linkedSystemId: o.linked_system_id || undefined,
    yourCost: Number(o.your_cost) || 0,
    peerAverageCost: Number(o.peer_average_cost) || 0,
    peerCount: o.peer_count || 0,
    potentialSaving: Number(o.potential_saving) || 0,
    adopted: o.adopted || false,
    peerDetails: (o.peer_details || []).map((p: any) => ({ municipalityAlias: p.municipality_alias || p.municipalityAlias || "", cost: Number(p.cost) || 0 })),
  };
}

export function dbPublishedToolToPlatform(t: any): PublishedTool {
  return {
    id: t.id,
    name: t.name,
    department: t.department || "",
    description: t.description || "",
    status: t.status || "Active",
    apis: t.apis || [],
    classification: t.classification || "",
    visibility: t.visibility || "internal",
    municipalityName: t.municipality_name || undefined,
    contactEmail: t.contact_email || undefined,
    linkedExperimentId: t.linked_experiment_id || undefined,
  };
}

// ─── Shared utility functions ─────────────────────────────────────────────────

export function getDaysUntilReview(reviewDate: string): number {
  const review = new Date(reviewDate);
  const now = new Date();
  return Math.ceil((review.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getReviewStatus(reviewDate: string): "overdue" | "urgent" | "upcoming" | "ok" {
  const days = getDaysUntilReview(reviewDate);
  if (days < 0) return "overdue";
  if (days <= 30) return "urgent";
  if (days <= 60) return "upcoming";
  return "ok";
}

export const securityCheckLabels: Record<string, string> = {
  separation: "Separate internal/external APIs",
  oauth: "OAuth2/OIDC authentication",
  audit: "Audit logging (no sensitive payloads)",
  dataMin: "Data minimization",
  gdpr: "GDPR cross-border compliance",
  centralized: "Centralized security defaults",
  tls: "HTTPS/TLS encryption",
};

export const lifecycleColors: Record<string, string> = {
  active: "hsl(152, 60%, 40%)",
  legacy: "hsl(0, 72%, 51%)",
  encapsulated: "hsl(38, 92%, 50%)",
  "review-needed": "hsl(38, 92%, 50%)",
  "end-of-life": "hsl(0, 72%, 51%)",
  decommissioning: "hsl(215, 14%, 46%)",
};

export const criticalityColors: Record<string, string> = {
  critical: "hsl(0, 72%, 51%)",
  high: "hsl(38, 92%, 50%)",
  medium: "hsl(199, 89%, 48%)",
  low: "hsl(152, 60%, 40%)",
};

export const strategicGoals = [
  "Ökad digital tillgänglighet för invånare",
  "Effektivisering av interna administrativa processer",
  "Stärkt informationssäkerhet och GDPR-efterlevnad",
  "Hållbar samhällsutveckling och digitalisering",
];

export const domains = [
  "IT & Digitalization",
  "HR & Organization",
  "Social Services",
  "Education",
  "Urban Planning",
  "Administration & Governance",
];

export const units = [
  "Kommunstyrelseförvaltningen",
  "Socialförvaltningen",
  "Barn- och utbildningsförvaltningen",
  "Stadsbyggnadsförvaltningen",
  "IT- och digitaliseringsenheten",
  "HR-avdelningen",
];

export const categories = [
  "Information Security",
  "HR Policy",
  "Digital Strategy",
  "Procurement",
  "Data Management",
  "Accessibility",
  "Quality Assurance",
  "Communication",
  "Archiving",
  "Case Management",
  "IT Governance",
  "GDPR Compliance",
];

/** Enriches systems with linked APIs and risks */
export function enrichSystems(
  systems: PlatformSystem[],
  risks: PlatformRisk[],
  apis: PlatformApi[]
): PlatformSystem[] {
  return systems.map(sys => ({
    ...sys,
    openRisks: risks.filter(r => r.linkedSystemId === sys.id).map(r => r.id),
    linkedApis: apis.filter(a => a.linkedSystemId === sys.id).map(a => a.id),
  }));
}

// ─── Risk auto-scoring ────────────────────────────────────────────────────────

export function computeLikelihood(risk: PlatformRisk, system: PlatformSystem | undefined, allRisks: PlatformRisk[]): { score: number; signals: string[] } {
  if (risk.likelihoodOverride) return { score: risk.likelihoodOverride, signals: ["Manually overridden"] };
  let score = risk.likelihood || 2;
  const signals: string[] = [`Base likelihood: ${score}`];
  if (system) {
    if (system.lifecycle === "legacy" || system.lifecycle === "end-of-life") {
      score = Math.max(score, 3);
      signals.push(`${system.lifecycle} system → min 3`);
    }
    if (system.internetFacing) {
      score += 1;
      signals.push("Internet-facing → +1");
    }
    const vulnCount = allRisks.filter(r => r.linkedSystemId === system.id && r.type === "vulnerability").length;
    if (vulnCount > 0) {
      const bonus = Math.min(vulnCount, 2);
      score += bonus;
      signals.push(`${vulnCount} vulnerability risk(s) → +${bonus}`);
    }
    if (system.contractEnd) {
      const daysUntil = (new Date(system.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntil > 0 && daysUntil < 90) {
        score += 1;
        signals.push("Contract expires within 90 days → +1");
      }
    }
  }
  return { score: Math.min(score, 5), signals };
}

export function computeImpact(risk: PlatformRisk, system: PlatformSystem | undefined): { score: number; signals: string[] } {
  if (risk.impactOverride) return { score: risk.impactOverride, signals: ["Manually overridden"] };
  let score = 1;
  const signals: string[] = [];
  if (system) {
    const ds = system.downstreamServices.length;
    if (ds >= 7) { score = 5; signals.push(`${ds} downstream services → 5`); }
    else if (ds >= 5) { score = 4; signals.push(`${ds} downstream services → 4`); }
    else if (ds >= 3) { score = 3; signals.push(`${ds} downstream services → 3`); }
    else if (ds >= 1) { score = 2; signals.push(`${ds} downstream services → 2`); }
    else { score = 1; signals.push("No downstream services → 1"); }

    const critCeiling: Record<string, number> = { low: 2, medium: 3, high: 4, critical: 5 };
    const ceiling = critCeiling[system.criticality] ?? 3;
    score = Math.max(score, ceiling);
    signals.push(`Criticality "${system.criticality}" ceiling → ${ceiling}`);

    if (system.annualCost > 2000) { score += 1; signals.push("Annual cost >2000 kSEK → +1"); }
    else if (system.annualCost > 500) { score += 1; signals.push("Annual cost >500 kSEK → +1"); }
  } else {
    score = risk.impact || 3;
    signals.push(`No linked system, using base impact: ${score}`);
  }
  return { score: Math.min(score, 5), signals };
}

// ─── 1-25 Risk Scale Helpers ──────────────────────────────────────────────────

export function getRiskScaleColor(score: number): string {
  if (score <= 5) return "hsl(152, 60%, 40%)";   // green — Low
  if (score <= 12) return "hsl(38, 92%, 50%)";    // yellow — Medium
  if (score <= 18) return "hsl(0, 72%, 51%)";     // red-orange — High
  return "hsl(0, 72%, 40%)";                       // deep red — Critical
}

export function getRiskScaleLabel(score: number): string {
  if (score <= 5) return "Low";
  if (score <= 12) return "Medium";
  if (score <= 18) return "High";
  return "Critical";
}

export function getRiskLevel(score: number): string {
  if (score >= 19) return "critical";
  if (score >= 13) return "high";
  if (score >= 6) return "medium";
  return "low";
}

export const riskLevelColors: Record<string, string> = {
  critical: "hsl(0, 72%, 40%)",
  high: "hsl(0, 72%, 51%)",
  medium: "hsl(38, 92%, 50%)",
  low: "hsl(152, 60%, 40%)",
};

// ─── Citizen Impact Score ─────────────────────────────────────────────────────

export function useCitizenImpactHistory(orgId?: string) {
  return useQuery({
    queryKey: ["citizen_impact_history", orgId],
    queryFn: async () => {
      let query = (supabase as any).from("citizen_impact_history").select("*").order("recorded_month", { ascending: true });
      if (orgId) query = query.eq("org_id", orgId);
      const { data, error } = await query;
      if (error) { console.warn("citizen_impact_history query failed:", error.message); return []; }
      return data as any[];
    },
  });
}

function cap100(v: number) { return Math.min(100, Math.max(0, Math.round(v))); }

export function useCitizenImpactScore(orgId?: string) {
  const { data: rawExperiments, isLoading: l1 } = useKnowledgeExperiments();
  const { data: rawTools, isLoading: l2 } = usePublishedTools();
  const { data: rawApis, isLoading: l3 } = useApis();
  const { data: rawDocs, isLoading: l4 } = useGovernanceDocs();
  const { data: rawKpisCdo, isLoading: l5 } = useKpiValues("cto"); // cdo kpis stored under cto role
  const { data: rawKpisCoo, isLoading: l6 } = useKpiValues("coo");

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;

  const result = useMemo(() => {
    if (isLoading) return null;

    const experiments = rawExperiments || [];
    const tools = rawTools || [];
    const apis = rawApis || [];
    const docs = rawDocs || [];
    const kpisCdo = rawKpisCdo || [];
    const kpisCoo = rawKpisCoo || [];

    // Departments count
    const deptSet = new Set<string>();
    [...experiments, ...tools].forEach((item: any) => { if (item.department) deptSet.add(item.department); });
    const totalDepts = Math.max(deptSet.size, 6); // minimum 6 known departments

    // 1. SERVICE ACCESSIBILITY (20%)
    const activeTools = tools.filter((t: any) => t.status === "Active" || t.status === "active").length;
    const accessDocs = docs.filter((d: any) => d.category === "Accessibility");
    const wcagDocs = accessDocs.filter((d: any) => d.security_checks?.gdpr === true || d.status === "Active").length;
    const accessPart1 = (activeTools / totalDepts) * 50;
    const accessPart2 = accessDocs.length > 0 ? (wcagDocs / accessDocs.length) * 50 : 25; // default 25 if no accessibility docs
    const accessibility = cap100(accessPart1 + accessPart2);

    // 2. TIME & PROCESS SAVINGS (25%)
    const totalExperiments = experiments.length;
    const scaledExperiments = experiments.filter((e: any) => e.completed && e.recommendation === "scale").length;
    const timeSavings = totalExperiments > 0 ? cap100((scaledExperiments / totalExperiments) * 100) : 0;

    // 3. CITIZEN ENGAGEMENT (20%)
    const publicApis = apis.filter((a: any) => a.type === "public").length;
    const totalApis = apis.length;
    const apiRatio = totalApis > 0 ? (publicApis / totalApis) * 50 : 0;
    const cooParticipation = kpisCoo.find((k: any) => k.kpi_id === "resident-satisfaction" || k.label?.toLowerCase().includes("satisfaction"));
    const cooVal = cooParticipation ? parseFloat(cooParticipation.value) || 0 : 0;
    const engagementPart2 = Math.min((cooVal / 100) * 50, 50);
    const engagement = cap100(apiRatio + engagementPart2);

    // 4. TRANSPARENCY & TRUST (20%)
    const completedExperiments = experiments.filter((e: any) => e.completed);
    const exitLogApproved = completedExperiments.filter((e: any) => e.exit_log_approved).length;
    const trustPart1 = completedExperiments.length > 0 ? (exitLogApproved / completedExperiments.length) * 50 : 0;
    const gdprDocs = docs.filter((d: any) => {
      const checks = d.security_checks || {};
      return checks.gdpr === true;
    }).length;
    const trustPart2 = docs.length > 0 ? (gdprDocs / docs.length) * 50 : 0;
    const trust = cap100(trustPart1 + trustPart2);

    // 5. DIGITAL EQUITY (15%)
    const cdoAccessKpi = kpisCdo.find((k: any) => k.kpi_id === "accessibility" || k.label?.toLowerCase().includes("accessibility"));
    const equityRaw = cdoAccessKpi ? parseFloat(cdoAccessKpi.value) || 0 : 0;
    const equity = cap100(equityRaw);

    const score = Math.round(
      0.20 * accessibility +
      0.25 * timeSavings +
      0.20 * engagement +
      0.20 * trust +
      0.15 * equity
    );

    let band: "At Risk" | "Developing" | "Delivering";
    let bandColor: string;
    if (score <= 40) { band = "At Risk"; bandColor = "hsl(0, 72%, 51%)"; }
    else if (score <= 70) { band = "Developing"; bandColor = "hsl(38, 92%, 50%)"; }
    else { band = "Delivering"; bandColor = "hsl(152, 60%, 40%)"; }

    return { score, accessibility, timeSavings, engagement, trust, equity, band, bandColor };
  }, [isLoading, rawExperiments, rawTools, rawApis, rawDocs, rawKpisCdo, rawKpisCoo]);

  return {
    score: result?.score ?? 0,
    accessibility: result?.accessibility ?? 0,
    timeSavings: result?.timeSavings ?? 0,
    engagement: result?.engagement ?? 0,
    trust: result?.trust ?? 0,
    equity: result?.equity ?? 0,
    band: result?.band ?? ("Developing" as const),
    bandColor: result?.bandColor ?? "hsl(38, 92%, 50%)",
    isLoading,
  };
}
