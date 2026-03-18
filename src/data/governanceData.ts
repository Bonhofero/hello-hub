export interface GovernanceDocument {
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
}

export interface Contradiction {
  id: string;
  docAId: string;
  docBId: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  resolved: boolean;
}

export interface DataStandard {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Draft" | "Deprecated";
  linkedDocIds: string[];
}

export interface CoreSystem {
  id: string;
  name: string;
  vendor: string;
  description: string;
  linkedDocIds: string[];
}

export const strategicGoals = [
  "Ökad digital tillgänglighet för invånare",
  "Effektivisering av interna administrativa processer",
  "Stärkt informationssäkerhet och GDPR-efterlevnad",
  "Hållbar samhällsutveckling och digitalisering",
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

export const domains = [
  "IT & Digitalization",
  "HR & Organization",
  "Social Services",
  "Education",
  "Urban Planning",
  "Administration & Governance",
];

const today = new Date();
const daysFromNow = (d: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + d);
  return date.toISOString().split("T")[0];
};

export const governanceDocuments: GovernanceDocument[] = [
  {
    id: "GOV-001",
    title: "Riktlinje för informationssäkerhet",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Operational",
    category: "Information Security",
    reviewDate: daysFromNow(-45),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2022-03-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-003"],
    linkedCoreSystems: ["SYS-001", "SYS-003"],
    escalatedToBoard: false,
    strategicGoals: ["Stärkt informationssäkerhet och GDPR-efterlevnad"],
    keywords: ["information security", "policy", "data protection", "IT"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-002",
    title: "Policy för distansarbete",
    owner: "Per Johansson",
    ownerTitle: "HR-chef",
    unit: "HR-avdelningen",
    classification: "Operational",
    category: "HR Policy",
    reviewDate: daysFromNow(14),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-01-10",
    securityChecks: { gdpr: true, dataMin: true, audit: false, tls: true, oauth: false, separation: false, centralized: false },
    linkedStandards: ["STD-002"],
    linkedCoreSystems: ["SYS-002"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["remote work", "HR", "work policy", "telework"],
    domain: "HR & Organization",
  },
  {
    id: "GOV-003",
    title: "Rutin för ärendehandläggning inom socialtjänsten",
    owner: "Maria Ekberg",
    ownerTitle: "Socialchef",
    unit: "Socialförvaltningen",
    classification: "Operational",
    category: "Case Management",
    reviewDate: daysFromNow(90),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-06-01",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-004"],
    linkedCoreSystems: ["SYS-004"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["case management", "social services", "process", "routine"],
    domain: "Social Services",
  },
  {
    id: "GOV-004",
    title: "Digitaliseringsstrategi 2024–2027",
    owner: "Erik Lundqvist",
    ownerTitle: "Digitaliseringschef",
    unit: "Kommunstyrelseförvaltningen",
    classification: "Development/Innovation",
    category: "Digital Strategy",
    reviewDate: daysFromNow(180),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2024-01-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-002", "STD-003"],
    linkedCoreSystems: ["SYS-001", "SYS-002", "SYS-003"],
    escalatedToBoard: true,
    strategicGoals: ["Ökad digital tillgänglighet för invånare", "Hållbar samhällsutveckling och digitalisering"],
    keywords: ["digitalization", "strategy", "innovation", "IT", "digital services"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-005",
    title: "Riktlinje för upphandling av IT-system",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Operational",
    category: "Procurement",
    reviewDate: daysFromNow(60),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2022-09-01",
    securityChecks: { gdpr: true, dataMin: false, audit: true, tls: true, oauth: false, separation: true, centralized: false },
    linkedStandards: ["STD-003"],
    linkedCoreSystems: ["SYS-001"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["procurement", "IT systems", "purchasing", "vendor"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-006",
    title: "Arkivreglemente för digitala handlingar",
    owner: "Karin Nilsson",
    ownerTitle: "Kommunsekreterare",
    unit: "Kommunstyrelseförvaltningen",
    classification: "Operational",
    category: "Archiving",
    reviewDate: daysFromNow(120),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2021-11-20",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: false, centralized: true },
    linkedStandards: ["STD-004"],
    linkedCoreSystems: ["SYS-005"],
    escalatedToBoard: false,
    strategicGoals: ["Stärkt informationssäkerhet och GDPR-efterlevnad"],
    keywords: ["archive", "digital records", "document management", "retention"],
    domain: "Administration & Governance",
  },
  {
    id: "GOV-007",
    title: "Rutin för tillgänglighetsanpassning av digitala tjänster",
    owner: "Erik Lundqvist",
    ownerTitle: "Digitaliseringschef",
    unit: "IT- och digitaliseringsenheten",
    classification: "Development/Innovation",
    category: "Accessibility",
    reviewDate: daysFromNow(45),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-04-01",
    securityChecks: { gdpr: true, dataMin: true, audit: false, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-002", "STD-005"],
    linkedCoreSystems: ["SYS-001", "SYS-006"],
    escalatedToBoard: false,
    strategicGoals: ["Ökad digital tillgänglighet för invånare"],
    keywords: ["accessibility", "WCAG", "digital services", "inclusive design"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-008",
    title: "Policy mot kränkande särbehandling",
    owner: "Per Johansson",
    ownerTitle: "HR-chef",
    unit: "HR-avdelningen",
    classification: "Operational",
    category: "HR Policy",
    reviewDate: daysFromNow(200),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2022-05-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: false, oauth: false, separation: false, centralized: false },
    linkedStandards: [],
    linkedCoreSystems: ["SYS-002"],
    escalatedToBoard: false,
    strategicGoals: [],
    keywords: ["harassment", "workplace", "discrimination", "HR policy"],
    domain: "HR & Organization",
  },
  {
    id: "GOV-009",
    title: "Plan för systematiskt kvalitetsarbete i skolan",
    owner: "Lena Berggren",
    ownerTitle: "Utbildningschef",
    unit: "Barn- och utbildningsförvaltningen",
    classification: "Operational",
    category: "Quality Assurance",
    reviewDate: daysFromNow(30),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-08-20",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: false, centralized: true },
    linkedStandards: ["STD-005"],
    linkedCoreSystems: ["SYS-007"],
    escalatedToBoard: false,
    strategicGoals: ["Hållbar samhällsutveckling och digitalisering"],
    keywords: ["quality", "education", "school", "systematic improvement"],
    domain: "Education",
  },
  {
    id: "GOV-010",
    title: "Riktlinje för sociala medier",
    owner: "Karin Nilsson",
    ownerTitle: "Kommunsekreterare",
    unit: "Kommunstyrelseförvaltningen",
    classification: "Operational",
    category: "Communication",
    reviewDate: daysFromNow(-30),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2021-06-10",
    securityChecks: { gdpr: false, dataMin: false, audit: false, tls: true, oauth: false, separation: false, centralized: false },
    linkedStandards: [],
    linkedCoreSystems: [],
    escalatedToBoard: false,
    strategicGoals: ["Ökad digital tillgänglighet för invånare"],
    keywords: ["social media", "communication", "public relations", "guidelines"],
    domain: "Administration & Governance",
  },
  {
    id: "GOV-011",
    title: "GDPR-policy för hantering av personuppgifter",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Operational",
    category: "GDPR Compliance",
    reviewDate: daysFromNow(-60),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2020-05-25",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-004"],
    linkedCoreSystems: ["SYS-001", "SYS-003", "SYS-004"],
    escalatedToBoard: true,
    strategicGoals: ["Stärkt informationssäkerhet och GDPR-efterlevnad"],
    keywords: ["GDPR", "personal data", "privacy", "data protection", "compliance"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-012",
    title: "Riktlinje för IT-upphandling (äldre version)",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Operational",
    category: "Procurement",
    reviewDate: daysFromNow(-120),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2019-03-01",
    securityChecks: { gdpr: false, dataMin: false, audit: true, tls: true, oauth: false, separation: false, centralized: false },
    linkedStandards: ["STD-003"],
    linkedCoreSystems: ["SYS-001"],
    escalatedToBoard: false,
    strategicGoals: [],
    keywords: ["procurement", "IT systems", "purchasing", "vendor", "legacy"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-013",
    title: "Strategi för e-tjänster och medborgardialog",
    owner: "Erik Lundqvist",
    ownerTitle: "Digitaliseringschef",
    unit: "Kommunstyrelseförvaltningen",
    classification: "Development/Innovation",
    category: "Digital Strategy",
    reviewDate: daysFromNow(150),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2024-02-01",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-002", "STD-005"],
    linkedCoreSystems: ["SYS-001", "SYS-006"],
    escalatedToBoard: true,
    strategicGoals: ["Ökad digital tillgänglighet för invånare", "Hållbar samhällsutveckling och digitalisering"],
    keywords: ["e-services", "citizen dialogue", "digital services", "participation"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-014",
    title: "Policy för handläggning av bygglov",
    owner: "Jonas Kraft",
    ownerTitle: "Stadsbyggnadschef",
    unit: "Stadsbyggnadsförvaltningen",
    classification: "Operational",
    category: "Case Management",
    reviewDate: daysFromNow(75),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2022-11-01",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: true, centralized: false },
    linkedStandards: ["STD-004"],
    linkedCoreSystems: ["SYS-008"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["building permit", "urban planning", "case handling", "construction"],
    domain: "Urban Planning",
  },
  {
    id: "GOV-015",
    title: "Riktlinje för molntjänster och datalagring",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Development/Innovation",
    category: "IT Governance",
    reviewDate: daysFromNow(25),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-10-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-003"],
    linkedCoreSystems: ["SYS-001", "SYS-003"],
    escalatedToBoard: false,
    strategicGoals: ["Stärkt informationssäkerhet och GDPR-efterlevnad", "Hållbar samhällsutveckling och digitalisering"],
    keywords: ["cloud", "data storage", "SaaS", "infrastructure", "IT"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-016",
    title: "Handlingsplan för krisberedskap",
    owner: "Karin Nilsson",
    ownerTitle: "Kommunsekreterare",
    unit: "Kommunstyrelseförvaltningen",
    classification: "Operational",
    category: "Quality Assurance",
    reviewDate: daysFromNow(210),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-03-01",
    securityChecks: { gdpr: true, dataMin: false, audit: true, tls: true, oauth: false, separation: true, centralized: true },
    linkedStandards: [],
    linkedCoreSystems: ["SYS-002"],
    escalatedToBoard: false,
    strategicGoals: [],
    keywords: ["crisis", "emergency", "preparedness", "contingency"],
    domain: "Administration & Governance",
  },
  {
    id: "GOV-017",
    title: "Rutin för introduktion av nyanställda",
    owner: "Per Johansson",
    ownerTitle: "HR-chef",
    unit: "HR-avdelningen",
    classification: "Operational",
    category: "HR Policy",
    reviewDate: daysFromNow(90),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-09-01",
    securityChecks: { gdpr: true, dataMin: true, audit: false, tls: false, oauth: false, separation: false, centralized: false },
    linkedStandards: [],
    linkedCoreSystems: ["SYS-002"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["onboarding", "new employees", "introduction", "HR"],
    domain: "HR & Organization",
  },
  {
    id: "GOV-018",
    title: "Policy för öppen data",
    owner: "Erik Lundqvist",
    ownerTitle: "Digitaliseringschef",
    unit: "IT- och digitaliseringsenheten",
    classification: "Development/Innovation",
    category: "Data Management",
    reviewDate: daysFromNow(100),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2024-03-01",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-002"],
    linkedCoreSystems: ["SYS-001"],
    escalatedToBoard: false,
    strategicGoals: ["Ökad digital tillgänglighet för invånare", "Hållbar samhällsutveckling och digitalisering"],
    keywords: ["open data", "transparency", "API", "public data"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-019",
    title: "Riktlinje för detaljplanering",
    owner: "Jonas Kraft",
    ownerTitle: "Stadsbyggnadschef",
    unit: "Stadsbyggnadsförvaltningen",
    classification: "Operational",
    category: "Case Management",
    reviewDate: daysFromNow(140),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2022-07-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: true, centralized: false },
    linkedStandards: ["STD-004"],
    linkedCoreSystems: ["SYS-008"],
    escalatedToBoard: false,
    strategicGoals: ["Hållbar samhällsutveckling och digitalisering"],
    keywords: ["detailed planning", "urban development", "zoning", "land use"],
    domain: "Urban Planning",
  },
  {
    id: "GOV-020",
    title: "Rutin för hantering av avvikelser inom socialtjänsten",
    owner: "Maria Ekberg",
    ownerTitle: "Socialchef",
    unit: "Socialförvaltningen",
    classification: "Operational",
    category: "Quality Assurance",
    reviewDate: daysFromNow(55),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-05-10",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-004"],
    linkedCoreSystems: ["SYS-004"],
    escalatedToBoard: false,
    strategicGoals: ["Effektivisering av interna administrativa processer"],
    keywords: ["deviation", "social services", "incident", "quality"],
    domain: "Social Services",
  },
  {
    id: "GOV-021",
    title: "Riktlinje för informationsklassificering",
    owner: "Anna Lindström",
    ownerTitle: "IT-strateg",
    unit: "IT- och digitaliseringsenheten",
    classification: "Operational",
    category: "Information Security",
    reviewDate: daysFromNow(85),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-02-01",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: true, separation: true, centralized: true },
    linkedStandards: ["STD-001", "STD-003"],
    linkedCoreSystems: ["SYS-001", "SYS-003"],
    escalatedToBoard: false,
    strategicGoals: ["Stärkt informationssäkerhet och GDPR-efterlevnad"],
    keywords: ["information classification", "data classification", "security", "labeling"],
    domain: "IT & Digitalization",
  },
  {
    id: "GOV-022",
    title: "Policy för elevhälsa och särskilt stöd",
    owner: "Lena Berggren",
    ownerTitle: "Utbildningschef",
    unit: "Barn- och utbildningsförvaltningen",
    classification: "Operational",
    category: "Quality Assurance",
    reviewDate: daysFromNow(170),
    status: "Active",
    replacesDocId: null,
    orgId: "ORG-VMK",
    createdDate: "2023-01-15",
    securityChecks: { gdpr: true, dataMin: true, audit: true, tls: true, oauth: false, separation: false, centralized: false },
    linkedStandards: ["STD-005"],
    linkedCoreSystems: ["SYS-007"],
    escalatedToBoard: false,
    strategicGoals: [],
    keywords: ["student health", "special support", "education", "welfare"],
    domain: "Education",
  },
];

export const contradictions: Contradiction[] = [
  {
    id: "CON-001",
    docAId: "GOV-005",
    docBId: "GOV-012",
    description: "GOV-005 (Riktlinje för upphandling av IT-system) conflicts with GOV-012 (Riktlinje för IT-upphandling – äldre version). Both define procurement processes for IT systems with differing approval thresholds and vendor evaluation criteria. The older version allows direct procurement up to 500 000 SEK while the new version sets the limit at 200 000 SEK.",
    severity: "High",
    resolved: false,
  },
  {
    id: "CON-002",
    docAId: "GOV-011",
    docBId: "GOV-015",
    description: "GOV-011 (GDPR-policy) requires all personal data to be stored within the EU, while GOV-015 (Riktlinje för molntjänster) permits cloud services with data processing in EEA countries under certain conditions. The definitions of acceptable jurisdictions are inconsistent.",
    severity: "Medium",
    resolved: false,
  },
];

export const dataStandards: DataStandard[] = [
  { id: "STD-001", name: "ISO 27001 Information Security", description: "International standard for information security management systems", status: "Active", linkedDocIds: ["GOV-001", "GOV-011", "GOV-015", "GOV-018", "GOV-020", "GOV-021"] },
  { id: "STD-002", name: "WCAG 2.1 Accessibility", description: "Web Content Accessibility Guidelines for digital services", status: "Active", linkedDocIds: ["GOV-002", "GOV-007", "GOV-013", "GOV-018"] },
  { id: "STD-003", name: "IT Infrastructure Standard (SKR)", description: "Swedish Association of Local Authorities recommended IT infrastructure framework", status: "Active", linkedDocIds: ["GOV-001", "GOV-005", "GOV-012", "GOV-015", "GOV-021"] },
  { id: "STD-004", name: "Swedish National Archives Regulations (RA-FS)", description: "Regulations for archiving and record management in public agencies", status: "Active", linkedDocIds: ["GOV-003", "GOV-006", "GOV-011", "GOV-014", "GOV-019", "GOV-020"] },
  { id: "STD-005", name: "DIGG Digital Service Standard", description: "Agency for Digital Government standards for public digital services", status: "Active", linkedDocIds: ["GOV-007", "GOV-009", "GOV-013", "GOV-022"] },
];

export const coreSystems: CoreSystem[] = [
  { id: "SYS-001", name: "Kommun-IT Platform", vendor: "Tieto EVRY", description: "Central IT platform for municipal operations", linkedDocIds: ["GOV-001", "GOV-004", "GOV-005", "GOV-007", "GOV-011", "GOV-013", "GOV-015", "GOV-018", "GOV-021"] },
  { id: "SYS-002", name: "HR-systemet Personec", vendor: "Visma", description: "HR and payroll management system", linkedDocIds: ["GOV-002", "GOV-008", "GOV-016", "GOV-017"] },
  { id: "SYS-003", name: "IT-säkerhetsplattform", vendor: "Microsoft 365/Sentinel", description: "Security monitoring and identity management platform", linkedDocIds: ["GOV-001", "GOV-004", "GOV-011", "GOV-015", "GOV-021"] },
  { id: "SYS-004", name: "Procapita", vendor: "CGI", description: "Case management for social services", linkedDocIds: ["GOV-003", "GOV-011", "GOV-020"] },
  { id: "SYS-005", name: "Platina", vendor: "Formpipe", description: "Document and records management system", linkedDocIds: ["GOV-006"] },
  { id: "SYS-006", name: "E-tjänsteplattform", vendor: "Open ePlatform", description: "Citizen-facing e-services portal", linkedDocIds: ["GOV-007", "GOV-013"] },
  { id: "SYS-007", name: "Skolplattformen", vendor: "IST", description: "School administration and learning management", linkedDocIds: ["GOV-009", "GOV-022"] },
  { id: "SYS-008", name: "ByggR", vendor: "Tekis", description: "Building permit and urban planning system", linkedDocIds: ["GOV-014", "GOV-019"] },
];

export const securityCheckLabels: Record<string, string> = {
  separation: "Separate internal/external APIs",
  oauth: "OAuth2/OIDC authentication",
  audit: "Audit logging (no sensitive payloads)",
  dataMin: "Data minimization",
  gdpr: "GDPR cross-border compliance",
  centralized: "Centralized security defaults",
  tls: "HTTPS/TLS encryption",
};

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

export function detectContradictions(newDoc: Partial<GovernanceDocument>, existingDocs: GovernanceDocument[]): GovernanceDocument[] {
  if (!newDoc.keywords || !newDoc.domain) return [];
  return existingDocs.filter((doc) => {
    if (doc.domain !== newDoc.domain) return false;
    const overlap = doc.keywords.filter((k) => newDoc.keywords!.includes(k));
    return overlap.length >= 2;
  });
}

export function checkComplianceConflicts(newDoc: Partial<GovernanceDocument>, standards: DataStandard[], systems: CoreSystem[]): string[] {
  const flags: string[] = [];
  if (newDoc.securityChecks) {
    if (!newDoc.securityChecks.gdpr) flags.push("Missing GDPR cross-border compliance — required by ISO 27001 and RA-FS standards");
    if (!newDoc.securityChecks.tls) flags.push("Missing HTTPS/TLS encryption — required by IT Infrastructure Standard (SKR)");
    if (!newDoc.securityChecks.audit) flags.push("Missing audit logging — recommended by all active data standards");
  }
  return flags;
}
