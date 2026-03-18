/**
 * Shared platform data for cross-module linking.
 * All system, risk, cost, and governance data centralized here
 * for consistent cross-referencing across System Map, Risk, Cost, and Overview dashboards.
 */

import type { Criticality } from "./sharedTypes";

// ─── Systems ───────────────────────────────────────────────────────────────────
export interface PlatformSystem {
  id: string;
  name: string;
  type: "application" | "database" | "server" | "network" | "storage" | "service" | "legacy" | "saas";
  owner: string;
  ownerTitle: string;
  department: string;
  orgId: string;
  domain: string;
  lifecycle: "active" | "legacy" | "encapsulated" | "review-needed" | "end-of-life" | "decommissioning";
  criticality: Criticality;
  annualCost: number; // kSEK
  maintenanceCost: number;
  developmentCost: number;
  vendor: string;
  contractEnd: string;
  lockInRisk: "high" | "medium" | "low";
  apiReusePotential: "high" | "medium" | "low";
  replacementPriority: "urgent" | "planned" | "none";
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
}

export const platformSystems: PlatformSystem[] = [
  {
    id: "SYS-001", name: "E-Services Portal", type: "application", owner: "Erik Lundqvist", ownerTitle: "CDO",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "review-needed", criticality: "critical", annualCost: 4200, maintenanceCost: 2800, developmentCost: 1400,
    vendor: "Open ePlatform", contractEnd: "2026-06-30", lockInRisk: "medium", apiReusePotential: "high", replacementPriority: "urgent",
    linkedApis: ["API-001", "API-005"], dependencies: ["SYS-002", "SYS-005", "SYS-003"],
    downstreamServices: ["Citizen self-service", "Building permits online", "School enrollment"],
    openRisks: ["RSK-001"], standardsUsed: ["STD-002", "STD-005"], linkedGovDocs: ["GOV-007", "GOV-013"],
    lastReviewDate: "2025-09-15", description: "Citizen-facing portal for all digital municipal services. Approaching EOL.",
    x: 400, y: 60,
  },
  {
    id: "SYS-002", name: "Identity Management (AD)", type: "service", owner: "Anna Lindström", ownerTitle: "IT Strategist",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "active", criticality: "critical", annualCost: 1800, maintenanceCost: 1200, developmentCost: 600,
    vendor: "Microsoft", contractEnd: "2028-12-31", lockInRisk: "high", apiReusePotential: "medium", replacementPriority: "none",
    linkedApis: ["API-002"], dependencies: ["SYS-007"],
    downstreamServices: ["All authenticated services", "SSO", "VPN"],
    openRisks: [], standardsUsed: ["STD-001", "STD-003"], linkedGovDocs: ["GOV-001", "GOV-004"],
    lastReviewDate: "2026-01-10", description: "Central Active Directory for all municipal authentication and authorization.",
    x: 180, y: 180,
  },
  {
    id: "SYS-003", name: "Case Management (Procapita)", type: "application", owner: "Maria Ekberg", ownerTitle: "Social Services Director",
    department: "Social Services", orgId: "org-eskilstuna", domain: "Social Services",
    lifecycle: "active", criticality: "high", annualCost: 3100, maintenanceCost: 2200, developmentCost: 900,
    vendor: "CGI", contractEnd: "2027-03-31", lockInRisk: "high", apiReusePotential: "low", replacementPriority: "planned",
    linkedApis: ["API-003"], dependencies: ["SYS-005", "SYS-002"],
    downstreamServices: ["Social services case handling", "Child welfare", "Elder care coordination"],
    openRisks: ["RSK-004"], standardsUsed: ["STD-001", "STD-004"], linkedGovDocs: ["GOV-003", "GOV-020"],
    lastReviewDate: "2025-11-20", description: "Primary case management for social services department.",
    x: 620, y: 180,
  },
  {
    id: "SYS-004", name: "Payroll System HR+", type: "legacy", owner: "Per Johansson", ownerTitle: "HR Director",
    department: "HR", orgId: "org-eskilstuna", domain: "HR & Organization",
    lifecycle: "legacy", criticality: "high", annualCost: 2400, maintenanceCost: 2100, developmentCost: 300,
    vendor: "Visma", contractEnd: "2026-12-31", lockInRisk: "high", apiReusePotential: "low", replacementPriority: "urgent",
    linkedApis: [], dependencies: ["SYS-005", "SYS-002"],
    downstreamServices: ["Payroll processing", "Leave management", "Tax reporting"],
    openRisks: ["RSK-002"], standardsUsed: [], linkedGovDocs: ["GOV-002", "GOV-008", "GOV-017"],
    lastReviewDate: "2024-06-01", description: "Legacy COBOL-based payroll with known vulnerabilities. Replacement planned.",
    x: 120, y: 320,
  },
  {
    id: "SYS-005", name: "SQL Server Cluster", type: "database", owner: "Anna Lindström", ownerTitle: "IT Strategist",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "active", criticality: "critical", annualCost: 1600, maintenanceCost: 1100, developmentCost: 500,
    vendor: "Microsoft", contractEnd: "2028-06-30", lockInRisk: "medium", apiReusePotential: "medium", replacementPriority: "none",
    linkedApis: ["API-004"], dependencies: ["SYS-007"],
    downstreamServices: ["All database-dependent applications"],
    openRisks: [], standardsUsed: ["STD-001", "STD-003"], linkedGovDocs: ["GOV-015"],
    lastReviewDate: "2026-02-01", description: "Central database cluster serving all municipal applications.",
    x: 400, y: 300,
  },
  {
    id: "SYS-006", name: "Central File Server", type: "storage", owner: "Anna Lindström", ownerTitle: "IT Strategist",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "review-needed", criticality: "high", annualCost: 800, maintenanceCost: 650, developmentCost: 150,
    vendor: "Dell EMC", contractEnd: "2026-09-30", lockInRisk: "low", apiReusePotential: "low", replacementPriority: "planned",
    linkedApis: [], dependencies: ["SYS-007"],
    downstreamServices: ["Document storage", "Shared drives", "Archiving"],
    openRisks: ["RSK-003"], standardsUsed: ["STD-004"], linkedGovDocs: ["GOV-006"],
    lastReviewDate: "2025-08-15", description: "Central file storage at 87% capacity. Cloud migration assessment underway.",
    x: 660, y: 320,
  },
  {
    id: "SYS-007", name: "Municipal DC (on-prem)", type: "server", owner: "Anna Lindström", ownerTitle: "IT Strategist",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "active", criticality: "critical", annualCost: 5200, maintenanceCost: 4000, developmentCost: 1200,
    vendor: "Dell / Cisco", contractEnd: "2029-12-31", lockInRisk: "medium", apiReusePotential: "low", replacementPriority: "none",
    linkedApis: [], dependencies: [],
    downstreamServices: ["All on-premises infrastructure"],
    openRisks: [], standardsUsed: ["STD-003"], linkedGovDocs: ["GOV-016"],
    lastReviewDate: "2026-01-15", description: "Primary data center hosting all on-premises workloads.",
    x: 400, y: 440,
  },
  {
    id: "SYS-008", name: "GIS Platform", type: "application", owner: "Jonas Kraft", ownerTitle: "Urban Planning Director",
    department: "Urban Planning", orgId: "org-eskilstuna", domain: "Urban Planning",
    lifecycle: "active", criticality: "medium", annualCost: 1200, maintenanceCost: 800, developmentCost: 400,
    vendor: "Esri / Lantmäteriet", contractEnd: "2027-06-30", lockInRisk: "medium", apiReusePotential: "high", replacementPriority: "none",
    linkedApis: ["API-006"], dependencies: ["SYS-005", "SYS-002"],
    downstreamServices: ["Map services", "Spatial analysis", "Citizen map portal"],
    openRisks: ["RSK-005"], standardsUsed: ["STD-005"], linkedGovDocs: ["GOV-014", "GOV-019"],
    lastReviewDate: "2025-12-01", description: "Geographic information system for urban planning and public maps.",
    x: 80, y: 80,
  },
  {
    id: "SYS-009", name: "School Platform (IST)", type: "saas", owner: "Lena Berggren", ownerTitle: "Education Director",
    department: "Education & Schools", orgId: "org-eskilstuna", domain: "Education",
    lifecycle: "active", criticality: "high", annualCost: 1500, maintenanceCost: 900, developmentCost: 600,
    vendor: "IST", contractEnd: "2027-12-31", lockInRisk: "medium", apiReusePotential: "medium", replacementPriority: "none",
    linkedApis: ["API-007"], dependencies: ["SYS-002"],
    downstreamServices: ["School administration", "Grade reporting", "Attendance"],
    openRisks: ["RSK-008"], standardsUsed: ["STD-005"], linkedGovDocs: ["GOV-009", "GOV-022"],
    lastReviewDate: "2026-01-20", description: "SaaS-based school administration and learning management.",
    x: 720, y: 80,
  },
  {
    id: "SYS-010", name: "Building Permit System (ByggR)", type: "application", owner: "Jonas Kraft", ownerTitle: "Urban Planning Director",
    department: "Urban Planning", orgId: "org-eskilstuna", domain: "Urban Planning",
    lifecycle: "active", criticality: "medium", annualCost: 900, maintenanceCost: 600, developmentCost: 300,
    vendor: "Tekis", contractEnd: "2027-09-30", lockInRisk: "low", apiReusePotential: "medium", replacementPriority: "none",
    linkedApis: ["API-008"], dependencies: ["SYS-005", "SYS-008"],
    downstreamServices: ["Building permit processing", "Inspections"],
    openRisks: [], standardsUsed: ["STD-004"], linkedGovDocs: ["GOV-014"],
    lastReviewDate: "2025-10-01", description: "Building permit and urban planning case management.",
    x: 80, y: 200,
  },
  {
    id: "SYS-011", name: "Email (Exchange Online)", type: "saas", owner: "Anna Lindström", ownerTitle: "IT Strategist",
    department: "IT & Digitalisation", orgId: "org-eskilstuna", domain: "IT & Digitalization",
    lifecycle: "active", criticality: "high", annualCost: 2200, maintenanceCost: 1800, developmentCost: 400,
    vendor: "Microsoft", contractEnd: "2028-12-31", lockInRisk: "high", apiReusePotential: "low", replacementPriority: "none",
    linkedApis: ["API-009"], dependencies: ["SYS-002"],
    downstreamServices: ["Email", "Calendar", "Teams integration"],
    openRisks: ["RSK-006"], standardsUsed: ["STD-001"], linkedGovDocs: ["GOV-011"],
    lastReviewDate: "2026-02-15", description: "Microsoft 365 email and collaboration platform.",
    x: 720, y: 200,
  },
  {
    id: "SYS-012", name: "Intranet (SharePoint)", type: "application", owner: "Karin Nilsson", ownerTitle: "Municipal Secretary",
    department: "Municipal Executive Office", orgId: "org-eskilstuna", domain: "Administration & Governance",
    lifecycle: "active", criticality: "medium", annualCost: 600, maintenanceCost: 400, developmentCost: 200,
    vendor: "Microsoft", contractEnd: "2028-12-31", lockInRisk: "medium", apiReusePotential: "low", replacementPriority: "none",
    linkedApis: [], dependencies: ["SYS-002", "SYS-011"],
    downstreamServices: ["Internal communication", "Document collaboration"],
    openRisks: ["RSK-007"], standardsUsed: ["STD-002"], linkedGovDocs: ["GOV-010"],
    lastReviewDate: "2025-07-01", description: "Internal staff portal and document collaboration.",
    x: 720, y: 320,
  },
];

// ─── Risks ─────────────────────────────────────────────────────────────────────
export interface PlatformRisk {
  id: string;
  title: string;
  type: "end-of-life" | "vulnerability" | "single-point-of-failure" | "capacity" | "compliance" | "certificate" | "availability";
  linkedSystemId: string;
  linkedDependency?: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  affectedServices: string[];
  owner: string;
  mitigation: string;
  dueDate: string;
  escalationStatus: "none" | "department" | "board";
  boardVisibility: boolean;
  lastUpdated: string;
  source: string;
  category: string;
}

export const platformRisks: PlatformRisk[] = [
  {
    id: "RSK-001", title: "E-Services Portal EOL", type: "end-of-life", linkedSystemId: "SYS-001",
    likelihood: 5, impact: 5, affectedServices: ["Citizen self-service", "Building permits online", "School enrollment"],
    owner: "Erik Lundqvist", mitigation: "Migration to new platform planned for Q3 2026",
    dueDate: "2026-06-30", escalationStatus: "board", boardVisibility: true,
    lastUpdated: "2026-03-01", source: "System inventory", category: "End-of-Life",
  },
  {
    id: "RSK-002", title: "HR+ Payroll Unpatched CVEs", type: "vulnerability", linkedSystemId: "SYS-004",
    likelihood: 4, impact: 5, affectedServices: ["Payroll processing", "Leave management", "Tax reporting"],
    owner: "Per Johansson", mitigation: "Legacy encapsulation strategy — WAF and network segmentation applied",
    dueDate: "2026-09-30", escalationStatus: "department", boardVisibility: false,
    lastUpdated: "2026-02-15", source: "Vulnerability scan", category: "Vulnerability",
  },
  {
    id: "RSK-003", title: "File Server Capacity Critical", type: "capacity", linkedSystemId: "SYS-006",
    linkedDependency: "SYS-007", likelihood: 4, impact: 4,
    affectedServices: ["Document storage", "Shared drives", "Archiving"],
    owner: "Anna Lindström", mitigation: "Cloud migration assessment in progress. Temporary capacity expansion ordered.",
    dueDate: "2026-07-15", escalationStatus: "department", boardVisibility: false,
    lastUpdated: "2026-03-10", source: "Monitoring", category: "Capacity",
  },
  {
    id: "RSK-004", title: "Procapita SSL Certificate Expiry", type: "certificate", linkedSystemId: "SYS-003",
    likelihood: 3, impact: 4, affectedServices: ["Social services case handling"],
    owner: "Maria Ekberg", mitigation: "Certificate renewal scheduled for April 2026",
    dueDate: "2026-04-15", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-02-20", source: "Certificate monitoring", category: "Certificate",
  },
  {
    id: "RSK-005", title: "GIS Platform Load Increase", type: "capacity", linkedSystemId: "SYS-008",
    likelihood: 3, impact: 3, affectedServices: ["Map services", "Spatial analysis"],
    owner: "Jonas Kraft", mitigation: "Scaling planned for Q3 2026",
    dueDate: "2026-09-01", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-01-15", source: "Performance monitoring", category: "Capacity",
  },
  {
    id: "RSK-006", title: "Exchange Missing GDPR Logging", type: "compliance", linkedSystemId: "SYS-011",
    likelihood: 2, impact: 3, affectedServices: ["Email compliance"],
    owner: "Anna Lindström", mitigation: "Microsoft Purview implementation planned Q2 2026",
    dueDate: "2026-06-30", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-02-01", source: "Compliance audit", category: "Compliance",
  },
  {
    id: "RSK-007", title: "SharePoint Missing Security Patch", type: "vulnerability", linkedSystemId: "SYS-012",
    likelihood: 3, impact: 2, affectedServices: ["Internal communication"],
    owner: "Anna Lindström", mitigation: "Patch scheduled for next maintenance window",
    dueDate: "2026-04-01", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-03-05", source: "Patch management", category: "Vulnerability",
  },
  {
    id: "RSK-008", title: "School Platform SLA Below Target", type: "availability", linkedSystemId: "SYS-009",
    likelihood: 2, impact: 2, affectedServices: ["School administration", "Grade reporting"],
    owner: "Lena Berggren", mitigation: "Vendor SLA renegotiation in progress",
    dueDate: "2026-05-31", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-03-01", source: "SLA monitoring", category: "Availability",
  },
  {
    id: "RSK-009", title: "Single Point of Failure — Municipal DC", type: "single-point-of-failure", linkedSystemId: "SYS-007",
    likelihood: 2, impact: 5, affectedServices: ["All on-premises infrastructure"],
    owner: "Anna Lindström", mitigation: "DR site assessment completed. Backup DC proposal submitted to board.",
    dueDate: "2027-01-01", escalationStatus: "board", boardVisibility: true,
    lastUpdated: "2026-02-20", source: "Infrastructure audit", category: "Single Point of Failure",
  },
  {
    id: "RSK-010", title: "AD — No Reviewed MFA Policy for Admin Accounts", type: "vulnerability", linkedSystemId: "SYS-002",
    likelihood: 3, impact: 5, affectedServices: ["All authenticated services", "SSO"],
    owner: "Anna Lindström", mitigation: "MFA enforcement for admin accounts planned Q2 2026",
    dueDate: "2026-06-01", escalationStatus: "department", boardVisibility: false,
    lastUpdated: "2026-03-12", source: "Security audit", category: "Vulnerability",
  },
  {
    id: "RSK-011", title: "Legacy Dependencies in Case Management", type: "end-of-life", linkedSystemId: "SYS-003",
    linkedDependency: "SYS-004", likelihood: 3, impact: 4,
    affectedServices: ["Social services case handling", "Payroll integration"],
    owner: "Maria Ekberg", mitigation: "Dependency mapping and decoupling strategy in progress",
    dueDate: "2026-12-31", escalationStatus: "none", boardVisibility: false,
    lastUpdated: "2026-01-20", source: "Dependency analysis", category: "End-of-Life",
  },
  {
    id: "RSK-012", title: "No Disaster Recovery for SQL Cluster", type: "single-point-of-failure", linkedSystemId: "SYS-005",
    linkedDependency: "SYS-007", likelihood: 2, impact: 5,
    affectedServices: ["All database-dependent applications"],
    owner: "Anna Lindström", mitigation: "Offsite replication setup planned for H2 2026",
    dueDate: "2026-12-31", escalationStatus: "board", boardVisibility: true,
    lastUpdated: "2026-02-28", source: "DR assessment", category: "Single Point of Failure",
  },
];

// ─── API Records ───────────────────────────────────────────────────────────────
export interface PlatformApi {
  id: string;
  name: string;
  type: "internal" | "partner" | "public";
  linkedSystemId: string;
  protocol: string;
  description: string;
}

export const platformApis: PlatformApi[] = [
  { id: "API-001", name: "E-Services REST API", type: "internal", linkedSystemId: "SYS-001", protocol: "REST", description: "Core API for citizen e-services" },
  { id: "API-002", name: "AD Authentication API", type: "internal", linkedSystemId: "SYS-002", protocol: "LDAP/REST", description: "Authentication and authorization" },
  { id: "API-003", name: "Procapita Integration API", type: "internal", linkedSystemId: "SYS-003", protocol: "SOAP", description: "Social services case data exchange" },
  { id: "API-004", name: "SQL Data API", type: "internal", linkedSystemId: "SYS-005", protocol: "REST", description: "Database access layer" },
  { id: "API-005", name: "BankID Integration", type: "partner", linkedSystemId: "SYS-001", protocol: "REST", description: "Swedish electronic ID authentication" },
  { id: "API-006", name: "GIS Map API", type: "public", linkedSystemId: "SYS-008", protocol: "REST/WMS", description: "Public map services and geodata" },
  { id: "API-007", name: "IST School API", type: "partner", linkedSystemId: "SYS-009", protocol: "REST", description: "School data integration" },
  { id: "API-008", name: "ByggR Permit API", type: "internal", linkedSystemId: "SYS-010", protocol: "REST", description: "Building permit data exchange" },
  { id: "API-009", name: "Microsoft Graph API", type: "partner", linkedSystemId: "SYS-011", protocol: "REST", description: "Email and collaboration data" },
];

// ─── KPI metadata helper ───────────────────────────────────────────────────────
export interface KpiMeta {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  trendLabel: string;
  lastUpdated: string;
  source: string;
  helper: string;
  linkTo: string;
}

// ─── Helper fns ────────────────────────────────────────────────────────────────
export function getSystemById(id: string) { return platformSystems.find(s => s.id === id); }
export function getRiskById(id: string) { return platformRisks.find(r => r.id === id); }
export function getRisksForSystem(systemId: string) { return platformRisks.filter(r => r.linkedSystemId === systemId); }
export function getSystemsWithOpenRisks() { return platformSystems.filter(s => s.openRisks.length > 0); }
export function getApiById(id: string) { return platformApis.find(a => a.id === id); }

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
