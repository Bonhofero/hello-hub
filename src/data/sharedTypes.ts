/** Shared entity types used across the platform */

export type VisibilityLevel = "internal" | "partner" | "public";
export type Criticality = "critical" | "high" | "medium" | "low";
export type EntityStatus = "active" | "draft" | "archived" | "deprecated" | "under-review";

export interface BaseEntity {
  id: string;
  orgId: string;
  name: string;
  owner: string;
  ownerTitle: string;
  domain: string;
  status: EntityStatus;
  visibilityLevel: VisibilityLevel;
  createdAt: string;
  lastReviewedAt: string;
  sourceType?: string;
  sourceLastUpdatedAt?: string;
}

export interface SystemAsset extends BaseEntity {
  type: "application" | "database" | "server" | "network" | "storage" | "service";
  vendor: string;
  version: string;
  criticality: Criticality;
  dependencies: string[];
  linkedApis: string[];
  endOfLife?: string;
  description: string;
}

export interface Dependency {
  id: string;
  sourceSystemId: string;
  targetSystemId: string;
  type: "data-flow" | "api-call" | "integration" | "authentication";
  description: string;
  criticality: Criticality;
}

export interface ApiRecord extends BaseEntity {
  type: "internal" | "partner" | "public";
  endpoint: string;
  version: string;
  protocol: "REST" | "GraphQL" | "SOAP" | "gRPC";
  linkedSystems: string[];
  rateLimitPerMin: number;
  authentication: string;
  description: string;
}

export interface RiskRecord extends BaseEntity {
  category: string;
  severity: Criticality;
  likelihood: Criticality;
  impact: string;
  mitigationPlan: string;
  linkedSystems: string[];
  dueDate: string;
}

export interface PortfolioItem extends BaseEntity {
  category: "development" | "operational";
  initiativeType: string;
  strategicGoals: string[];
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

export interface LearningLog extends BaseEntity {
  hypothesis: string;
  result: string;
  divergence: string;
  recommendation: "scale" | "iterate" | "stop";
  apisUsed: string[];
  impactMetrics: string;
  experimentDurationWeeks: number;
}
