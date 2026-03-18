export type IdeaStatus = "awaiting-review" | "under-experiment" | "published" | "standard-process" | "closed";

export interface Idea {
  id: string;
  title: string;
  description: string;
  department: string;
  contactName: string;
  contactEmail: string;
  dateSubmitted: string;
  status: IdeaStatus;
  fastTrack: boolean;
  fastTrackAnswers?: { looselyCoupled: boolean; underCost: boolean; reversible: boolean };
}

export interface Experiment {
  id: string;
  ideaId: string;
  title: string;
  owner: string;
  department: string;
  startedWeeksAgo: number;
  timeboxWeeks: number;
  progressPercent: number;
  tags: string[];
  isolated: boolean;
  noProductionAccess: boolean;
  mockDataOnly: boolean;
  hypothesis: string;
  observations: string;
  completed: boolean;
  result?: string;
  divergence?: string;
  recommendation?: "scale" | "iterate" | "stop";
  apisUsed?: string[];
  systemImpact?: string;
}

export interface PublishedTool {
  id: string;
  name: string;
  department: string;
  description: string;
  status: "Active" | "Active (Beta)" | "Archived";
  apis: string[];
}

export interface ExternalMunicipality {
  name: string;
  population: number;
  similarityScore: number;
  similarityLabel: string;
  group: 1 | 2;
  experiment: {
    title: string;
    apis: string[];
    impact: string;
    status: "scaled" | "under-experiment" | "iterating" | "stopped";
    domainTags: string[];
    systemFlow: string;
  };
  hasLearningLog: boolean;
  learningLog?: {
    hypothesis: string;
    result: string;
    divergence: string;
    recommendation: "scale" | "iterate" | "stop";
    systemImpact: string;
  };
}

export interface EskilstunaPublishedLog {
  id: string;
  title: string;
  department: string;
  description: string;
  recommendation: "Scaled" | "Iterated" | "Stopped";
  apis: string[];
  impact: string;
  datePublished: string;
}

export const departments = [
  "Municipal Executive Office",
  "Social Services",
  "Education & Schools",
  "Urban Planning & Environment",
  "IT & Digitalisation",
  "Culture & Leisure",
  "HR",
];

export const partnerOrganisations = [
  "Region Sörmland",
  "Strängnäs Municipality",
  "Västerås City",
  "Örebro Municipality",
];

export const initialIdeas: Idea[] = [
  {
    id: "idea-1",
    title: "Automatic Meeting Minutes",
    description: "AI-powered transcription and summarisation of internal meetings to save administrative time.",
    department: "IT & Digitalisation",
    contactName: "Anna Lindström",
    contactEmail: "anna.lindstrom@eskilstuna.se",
    dateSubmitted: "2026-01-15",
    status: "under-experiment",
    fastTrack: true,
    fastTrackAnswers: { looselyCoupled: true, underCost: true, reversible: true },
  },
  {
    id: "idea-2",
    title: "Digital Building Permit Submission",
    description: "Self-service portal for citizens to submit and track building permit applications digitally.",
    department: "Urban Planning & Environment",
    contactName: "Erik Lundqvist",
    contactEmail: "erik.lundqvist@eskilstuna.se",
    dateSubmitted: "2025-09-03",
    status: "published",
    fastTrack: true,
    fastTrackAnswers: { looselyCoupled: true, underCost: true, reversible: true },
  },
  {
    id: "idea-3",
    title: "Chatbot for Social Services Enquiries",
    description: "An AI chatbot to handle initial citizen enquiries to social services, triaging cases before human review.",
    department: "Social Services",
    contactName: "Maria Ekberg",
    contactEmail: "maria.ekberg@eskilstuna.se",
    dateSubmitted: "2026-02-28",
    status: "awaiting-review",
    fastTrack: true,
    fastTrackAnswers: { looselyCoupled: true, underCost: true, reversible: true },
  },
  {
    id: "idea-4",
    title: "Predictive Absence Analysis in Schools",
    description: "Machine learning model to predict and prevent student absences using historical attendance data.",
    department: "Education & Schools",
    contactName: "Per Johansson",
    contactEmail: "per.johansson@eskilstuna.se",
    dateSubmitted: "2026-02-10",
    status: "standard-process",
    fastTrack: false,
    fastTrackAnswers: { looselyCoupled: false, underCost: true, reversible: true },
  },
  {
    id: "idea-5",
    title: "Automated Scheduling for Home Care Services",
    description: "Optimised scheduling algorithm for home care visits based on care recipient needs and staff availability.",
    department: "Social Services",
    contactName: "Karin Nilsson",
    contactEmail: "karin.nilsson@eskilstuna.se",
    dateSubmitted: "2025-11-20",
    status: "closed",
    fastTrack: false,
    fastTrackAnswers: { looselyCoupled: true, underCost: false, reversible: false },
  },
];

export const experiments: Experiment[] = [
  {
    id: "exp-1",
    ideaId: "idea-1",
    title: "Automatic Meeting Minutes",
    owner: "Anna Lindström",
    department: "IT & Digitalisation",
    startedWeeksAgo: 3,
    timeboxWeeks: 10,
    progressPercent: 30,
    tags: ["#internal-tools", "#loosely-coupled"],
    isolated: true,
    noProductionAccess: true,
    mockDataOnly: true,
    hypothesis: "Automated meeting minutes will reduce administrative overhead by 60% and improve documentation quality.",
    observations: "Initial tests show accurate transcription for Swedish. Summarisation quality is good for structured meetings but needs tuning for open discussions.",
    completed: false,
  },
  {
    id: "exp-2",
    ideaId: "idea-2",
    title: "Digital Building Permit Submission",
    owner: "Erik Lundqvist",
    department: "Urban Planning & Environment",
    startedWeeksAgo: 20,
    timeboxWeeks: 12,
    progressPercent: 100,
    tags: ["#citizen-services", "#self-service"],
    isolated: true,
    noProductionAccess: true,
    mockDataOnly: false,
    hypothesis: "Self-service building permit submission will reduce processing time by 30%.",
    observations: "Citizens adopted digital submission at a higher rate than expected. Paper applications dropped by 67%.",
    completed: true,
    result: "Processing time reduced by 41% — exceeded expectations.",
    divergence: "Citizens adopted digital submission at a higher rate than expected; paper applications dropped by 67%.",
    recommendation: "scale",
    apisUsed: ["Eskilstuna Open Data API", "BankID integration"],
    systemImpact: "Building permit system Castor connected via REST API — no changes to production environment during experiment.",
  },
];

export const publishedTools: PublishedTool[] = [
  {
    id: "tool-1",
    name: "Building Permit Portal",
    department: "Urban Planning & Environment",
    description: "Digital self-service for submitting and tracking building permit applications.",
    status: "Active",
    apis: ["Castor", "BankID", "Eskilstuna Open Data"],
  },
  {
    id: "tool-2",
    name: "Meeting Assistant",
    department: "IT & Digitalisation",
    description: "Automatic transcription and summarisation of internal meetings.",
    status: "Active (Beta)",
    apis: ["Azure Speech", "Microsoft Graph"],
  },
  {
    id: "tool-3",
    name: "Home Care Scheduler",
    department: "Social Services",
    description: "Optimised scheduling based on care recipient needs and available staff.",
    status: "Archived",
    apis: ["Pulsen Combine"],
  },
];

export const eskilstunaPublishedLogs: EskilstunaPublishedLog[] = [
  {
    id: "log-1",
    title: "Building Permit Portal",
    department: "Urban Planning & Environment",
    description: "Self-service building permit submission reduced processing time by 41%. Paper applications dropped by 67%.",
    recommendation: "Scaled",
    apis: ["Castor", "BankID", "Eskilstuna Open Data"],
    impact: "41% faster processing, 67% reduction in paper applications",
    datePublished: "2026-01-20",
  },
  {
    id: "log-2",
    title: "Digital School Enrollment System",
    department: "Education & Schools",
    description: "Online enrollment for primary schools replaced paper-based process. Parents can now register, view school assignments, and appeal online.",
    recommendation: "Scaled",
    apis: ["IST Skola API", "BankID", "Eskilstuna Open Data"],
    impact: "Processing time reduced by 55%, 89% of parents chose digital enrollment in first year",
    datePublished: "2025-11-15",
  },
  {
    id: "log-3",
    title: "Citizen Feedback Aggregator",
    department: "Municipal Executive Office",
    description: "Centralized collection and analysis of citizen feedback across all departments using NLP sentiment analysis.",
    recommendation: "Iterated",
    apis: ["Azure Cognitive Services", "Microsoft Power BI"],
    impact: "Identified 3 systemic service issues within first quarter, response time to complaints improved by 22%",
    datePublished: "2026-02-01",
  },
  {
    id: "log-4",
    title: "Library Resource Optimizer",
    department: "Culture & Leisure",
    description: "Data-driven optimization of library book purchasing and inter-library loans based on usage patterns and regional demand.",
    recommendation: "Scaled",
    apis: ["LIBRIS API", "Axiell Arena"],
    impact: "Book utilization rate increased by 18%, inter-library loan costs reduced by SEK 120,000/year",
    datePublished: "2025-12-10",
  },
];

export const externalMunicipalities: ExternalMunicipality[] = [
  {
    name: "Gävle Municipality",
    population: 107000,
    similarityScore: 5,
    similarityLabel: "Very similar",
    group: 1,
    experiment: {
      title: "AI-based case triage for citizen services",
      apis: ["Microsoft Azure Cognitive Services", "Fortnox API"],
      impact: "Response time on citizen enquiries reduced by 28%",
      status: "scaled",
      domainTags: ["#citizen-services", "#internal-efficiency"],
      systemFlow: "Citizen Portal → Azure Cognitive Services API → Case Management System",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "AI-powered triage will reduce average response time for citizen enquiries by 25%.",
      result: "Response time reduced by 28%, exceeding the target. First-contact resolution improved by 15%.",
      divergence: "The AI model performed better on structured queries (permits, taxes) than anticipated but struggled with nuanced social services cases.",
      recommendation: "scale",
      systemImpact: "Integrated with existing case management via REST API. No changes to production databases.",
    },
  },
  {
    name: "Halmstad Municipality",
    population: 105000,
    similarityScore: 5,
    similarityLabel: "Very similar",
    group: 1,
    experiment: {
      title: "Automated invoice processing with OCR",
      apis: ["Visma API", "BankID"],
      impact: "Manual processing reduced by 55% in pilot",
      status: "under-experiment",
      domainTags: ["#internal-efficiency", "#data-quality"],
      systemFlow: "Invoice Inbox → Visma OCR API → Finance System",
    },
    hasLearningLog: false,
  },
  {
    name: "Sundsvall Municipality",
    population: 100000,
    similarityScore: 4,
    similarityLabel: "Similar",
    group: 1,
    experiment: {
      title: "Digital school absence reporting with parent portal",
      apis: ["IST Skola API", "Microsoft Teams webhooks"],
      impact: "Absence reports now processed in real time instead of next day",
      status: "scaled",
      domainTags: ["#citizen-services", "#data-quality"],
      systemFlow: "Parent Portal → IST Skola API → School Admin System",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "Real-time absence reporting will improve parental engagement and reduce unreported absences by 40%.",
      result: "Unreported absences decreased by 52%. Teacher admin time on attendance reduced by 35 minutes/day.",
      divergence: "Higher-than-expected adoption among parents of younger children (grades 1-3). Lower adoption in upper secondary.",
      recommendation: "scale",
      systemImpact: "IST Skola API integrated via webhooks. Microsoft Teams notifications for teachers. No production database changes.",
    },
  },
  {
    name: "Norrköping Municipality",
    population: 98000,
    similarityScore: 4,
    similarityLabel: "Similar",
    group: 1,
    experiment: {
      title: "Smart lighting control for public spaces",
      apis: ["IoT Sensor API", "Esri GIS API"],
      impact: "Energy consumption for street lighting reduced by 32% in pilot area",
      status: "scaled",
      domainTags: ["#sustainability", "#internal-efficiency"],
      systemFlow: "IoT Sensors → Sensor Gateway API → GIS Dashboard → Lighting Control System",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "Adaptive lighting based on pedestrian traffic will reduce energy costs by 20% without compromising safety.",
      result: "Energy reduction of 32%, no safety incidents reported. Citizen satisfaction unchanged.",
      divergence: "Savings exceeded target. Seasonal variation was larger than modeled — winter savings were lower.",
      recommendation: "scale",
      systemImpact: "IoT sensors connected via LoRaWAN. GIS dashboard read-only integration. No changes to existing infrastructure systems.",
    },
  },
  {
    name: "Linköping Municipality",
    population: 115000,
    similarityScore: 4,
    similarityLabel: "Similar",
    group: 1,
    experiment: {
      title: "Automated social assistance eligibility pre-screening",
      apis: ["Rasa NLU", "Swedish Population Register API"],
      impact: "Pre-screening time reduced from 45 min to 8 min per case",
      status: "scaled",
      domainTags: ["#citizen-services", "#internal-efficiency"],
      systemFlow: "Citizen Portal → Rasa NLU → Population Register API → Case Worker Dashboard",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "Automated pre-screening will reduce caseworker time on initial assessments by 50%.",
      result: "Time reduction of 82% for standard cases. Complex cases still require full manual review.",
      divergence: "The system flagged 12% of cases for manual review that would have been auto-approved — a desirable false-positive rate for safety.",
      recommendation: "scale",
      systemImpact: "Read-only integration with Population Register. No write access to production systems during experiment.",
    },
  },
  {
    name: "Borås Municipality",
    population: 114000,
    similarityScore: 3,
    similarityLabel: "Partial",
    group: 1,
    experiment: {
      title: "Digital citizen dialogue platform",
      apis: ["Decidim API", "BankID"],
      impact: "Citizen participation in planning consultations increased by 340%",
      status: "under-experiment",
      domainTags: ["#citizen-services", "#democracy"],
      systemFlow: "Citizen → BankID Auth → Decidim Platform → Planning Department Dashboard",
    },
    hasLearningLog: false,
  },
  {
    name: "Västerås City",
    population: 130000,
    similarityScore: 3,
    similarityLabel: "Partial",
    group: 2,
    experiment: {
      title: "Predictive maintenance of municipal infrastructure",
      apis: ["IoT Sensor API", "Esri GIS API"],
      impact: "Estimated cost saving of SEK 4.2M per year in pilot",
      status: "iterating",
      domainTags: ["#internal-efficiency", "#data-quality"],
      systemFlow: "IoT Sensors → Sensor API → GIS Dashboard",
    },
    hasLearningLog: false,
  },
  {
    name: "Örebro Municipality",
    population: 160000,
    similarityScore: 2,
    similarityLabel: "Limited",
    group: 2,
    experiment: {
      title: "Chatbot for social services intake",
      apis: ["Rasa NLU", "Swedish Population Register API"],
      impact: "34% of incoming enquiries handled without human intervention",
      status: "scaled",
      domainTags: ["#citizen-services", "#internal-efficiency"],
      systemFlow: "Citizen Portal → Rasa NLU API → Case Management System",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "A chatbot can handle at least 20% of initial social services enquiries without human intervention.",
      result: "34% of enquiries handled autonomously. User satisfaction rated 4.1/5.",
      divergence: "Higher adoption among younger citizens (18-35). Elderly citizens preferred phone contact.",
      recommendation: "scale",
      systemImpact: "Chatbot integrated via API gateway. Read-only access to case management system for status lookups.",
    },
  },
  {
    name: "Uppsala Municipality",
    population: 233000,
    similarityScore: 2,
    similarityLabel: "Limited",
    group: 2,
    experiment: {
      title: "AI-driven traffic flow optimization",
      apis: ["HERE Maps API", "IoT Sensor API", "Trafikverket Open Data"],
      impact: "Average commute time on pilot corridors reduced by 12%",
      status: "iterating",
      domainTags: ["#sustainability", "#citizen-services"],
      systemFlow: "Traffic Sensors → HERE Maps API → Traffic Control System → Trafikverket Reporting",
    },
    hasLearningLog: false,
  },
  {
    name: "Jönköping Municipality",
    population: 144000,
    similarityScore: 2,
    similarityLabel: "Limited",
    group: 2,
    experiment: {
      title: "Automated translation of municipal documents",
      apis: ["DeepL API", "Microsoft SharePoint API"],
      impact: "Translation time reduced by 85%, covering 12 languages",
      status: "scaled",
      domainTags: ["#citizen-services", "#internal-efficiency"],
      systemFlow: "Document Upload → DeepL API → SharePoint → Public Website",
    },
    hasLearningLog: true,
    learningLog: {
      hypothesis: "Automated translation will make municipal information accessible in 10+ languages within 24 hours of publication.",
      result: "12 languages supported. Average translation turnaround: 2 hours. Quality rated acceptable by bilingual reviewers in 94% of cases.",
      divergence: "Legal and regulatory documents required human review — automated quality was insufficient for binding texts.",
      recommendation: "scale",
      systemImpact: "DeepL API integrated with SharePoint via Azure Functions. No changes to website CMS.",
    },
  },
];

// Collect all unique APIs used across the Knowledge Hub for linking to API Management
export const knowledgeHubApis = {
  internal: [
    "Castor",
    "BankID",
    "Eskilstuna Open Data",
    "Azure Speech",
    "Microsoft Graph",
    "Pulsen Combine",
    "IST Skola API",
    "Azure Cognitive Services",
    "Microsoft Power BI",
    "LIBRIS API",
    "Axiell Arena",
  ],
  partner: [
    "Microsoft Azure Cognitive Services",
    "Fortnox API",
    "Visma API",
    "IST Skola API",
    "Microsoft Teams webhooks",
    "IoT Sensor API",
    "Esri GIS API",
    "Rasa NLU",
    "Swedish Population Register API",
    "Decidim API",
    "HERE Maps API",
    "Trafikverket Open Data",
    "DeepL API",
    "Microsoft SharePoint API",
  ],
};
