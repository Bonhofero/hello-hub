-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('cto', 'cfo', 'coo', 'partner', 'public');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  org_id TEXT,
  persona TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Organizations
CREATE TABLE public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  population INT,
  region TEXT,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizations readable by all" ON public.organizations FOR SELECT USING (true);

-- Vendors
CREATE TABLE public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  contact_email TEXT,
  website TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors readable by authenticated" ON public.vendors FOR SELECT TO authenticated USING (true);

-- Systems
CREATE TABLE public.systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  owner TEXT,
  owner_title TEXT,
  department TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  domain TEXT,
  lifecycle TEXT,
  criticality TEXT,
  annual_cost NUMERIC,
  maintenance_cost NUMERIC,
  development_cost NUMERIC,
  vendor_id TEXT,
  vendor_name TEXT,
  contract_end TEXT,
  lock_in_risk TEXT DEFAULT 'medium',
  api_reuse_potential TEXT DEFAULT 'medium',
  replacement_priority TEXT DEFAULT 'none',
  dependencies TEXT[] DEFAULT '{}',
  downstream_services TEXT[] DEFAULT '{}',
  standards_used TEXT[] DEFAULT '{}',
  linked_gov_docs TEXT[] DEFAULT '{}',
  last_review_date TEXT,
  description TEXT,
  x NUMERIC DEFAULT 0,
  y NUMERIC DEFAULT 0,
  visibility TEXT DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Systems readable by authenticated" ON public.systems FOR SELECT TO authenticated USING (true);

-- Risks
CREATE TABLE public.risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  linked_system_id TEXT,
  linked_dependency TEXT,
  likelihood INT,
  impact INT,
  affected_services TEXT[] DEFAULT '{}',
  owner TEXT,
  mitigation TEXT,
  due_date TEXT,
  escalation_status TEXT DEFAULT 'none',
  board_visibility BOOLEAN DEFAULT false,
  last_updated TEXT,
  source TEXT,
  category TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Risks readable by authenticated" ON public.risks FOR SELECT TO authenticated USING (true);

-- APIs
CREATE TABLE public.apis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  linked_system_id TEXT,
  protocol TEXT,
  description TEXT,
  endpoint TEXT,
  visibility TEXT DEFAULT 'internal',
  authentication TEXT,
  version TEXT DEFAULT 'v1',
  rate_limit_per_min INT DEFAULT 100,
  problems_solved TEXT[] DEFAULT '{}',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "APIs readable by all" ON public.apis FOR SELECT USING (true);

-- Governance Documents
CREATE TABLE public.governance_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT,
  owner_title TEXT,
  unit TEXT,
  classification TEXT,
  category TEXT,
  review_date TEXT,
  status TEXT DEFAULT 'Active',
  replaces_doc_id TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_date TEXT,
  security_checks JSONB DEFAULT '{}',
  linked_standards TEXT[] DEFAULT '{}',
  linked_core_systems TEXT[] DEFAULT '{}',
  escalated_to_board BOOLEAN DEFAULT false,
  strategic_goals TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  domain TEXT,
  has_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gov docs readable by authenticated" ON public.governance_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gov docs insertable by authenticated" ON public.governance_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Gov docs updatable by authenticated" ON public.governance_documents FOR UPDATE TO authenticated USING (true);

-- Governance Contradictions
CREATE TABLE public.governance_contradictions (
  id TEXT PRIMARY KEY,
  doc_a_id TEXT,
  doc_b_id TEXT,
  description TEXT,
  severity TEXT,
  resolved BOOLEAN DEFAULT false,
  explanation TEXT,
  rule_conflict TEXT,
  why_matters TEXT,
  review_next TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_contradictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contradictions readable by authenticated" ON public.governance_contradictions FOR SELECT TO authenticated USING (true);

-- Governance Standards
CREATE TABLE public.governance_standards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  linked_doc_ids TEXT[] DEFAULT '{}',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Standards readable by authenticated" ON public.governance_standards FOR SELECT TO authenticated USING (true);

-- Contracts
CREATE TABLE public.contracts (
  id TEXT PRIMARY KEY,
  vendor_id TEXT,
  system_id TEXT,
  title TEXT NOT NULL,
  annual_cost NUMERIC,
  start_date TEXT,
  end_date TEXT,
  lock_in_risk TEXT DEFAULT 'medium',
  renewal_type TEXT DEFAULT 'manual',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contracts readable by authenticated" ON public.contracts FOR SELECT TO authenticated USING (true);

-- Knowledge Ideas
CREATE TABLE public.knowledge_ideas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  contact_name TEXT,
  contact_email TEXT,
  date_submitted TEXT DEFAULT to_char(now(), 'YYYY-MM-DD'),
  status TEXT DEFAULT 'awaiting-review',
  classification TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ideas readable by authenticated" ON public.knowledge_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Ideas insertable by authenticated" ON public.knowledge_ideas FOR INSERT TO authenticated WITH CHECK (true);

-- Knowledge Experiments
CREATE TABLE public.knowledge_experiments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  idea_id TEXT,
  title TEXT NOT NULL,
  owner TEXT,
  department TEXT,
  started_weeks_ago INT,
  timebox_weeks INT,
  progress_percent INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  isolated BOOLEAN DEFAULT true,
  no_production_access BOOLEAN DEFAULT true,
  mock_data_only BOOLEAN DEFAULT true,
  hypothesis TEXT,
  observations TEXT,
  completed BOOLEAN DEFAULT false,
  result TEXT,
  divergence TEXT,
  recommendation TEXT,
  apis_used TEXT[] DEFAULT '{}',
  system_impact TEXT,
  classification TEXT,
  visibility TEXT DEFAULT 'internal',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experiments readable by authenticated" ON public.knowledge_experiments FOR SELECT TO authenticated USING (true);

-- Knowledge Published Tools
CREATE TABLE public.knowledge_published_tools (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  status TEXT DEFAULT 'Active',
  apis TEXT[] DEFAULT '{}',
  classification TEXT,
  visibility TEXT DEFAULT 'internal',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_published_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tools readable by authenticated" ON public.knowledge_published_tools FOR SELECT TO authenticated USING (true);

-- KPI Values
CREATE TABLE public.kpi_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  trend TEXT,
  trend_label TEXT,
  last_updated TEXT,
  source TEXT,
  helper TEXT,
  link_to TEXT,
  role TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kpi_id, role, org_id)
);
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "KPIs readable by authenticated" ON public.kpi_values FOR SELECT TO authenticated USING (true);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();