
-- ============================================================
-- IMS Platform Database Schema
-- ============================================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('cto', 'cfo', 'coo', 'partner', 'public');
CREATE TYPE public.system_lifecycle AS ENUM ('active', 'legacy', 'encapsulated', 'review-needed', 'end-of-life', 'decommissioning');
CREATE TYPE public.criticality_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.visibility_level AS ENUM ('internal', 'partner', 'public');
CREATE TYPE public.api_type AS ENUM ('internal', 'partner', 'public');
CREATE TYPE public.risk_type AS ENUM ('end-of-life', 'vulnerability', 'single-point-of-failure', 'capacity', 'compliance', 'certificate', 'availability');
CREATE TYPE public.escalation_status AS ENUM ('none', 'department', 'board');
CREATE TYPE public.idea_status AS ENUM ('awaiting-review', 'under-experiment', 'published', 'standard-process', 'closed');
CREATE TYPE public.knowledge_classification AS ENUM ('maintenance', 'efficiency', 'innovation', 'transformation');
CREATE TYPE public.gov_doc_status AS ENUM ('Active', 'Under Review', 'Draft', 'Archived');
CREATE TYPE public.gov_classification AS ENUM ('Operational', 'Development/Innovation');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- Organizations
-- ============================================================
CREATE TABLE public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  population INTEGER,
  region TEXT,
  type TEXT NOT NULL DEFAULT 'municipality',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read organizations" ON public.organizations FOR SELECT USING (true);

-- ============================================================
-- Profiles (linked to auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  persona TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- User Roles
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============================================================
-- Vendors
-- ============================================================
CREATE TABLE public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT DEFAULT 'Sweden',
  contact_email TEXT,
  website TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read vendors" ON public.vendors FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Contracts
-- ============================================================
CREATE TABLE public.contracts (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(id),
  system_id TEXT,
  title TEXT NOT NULL,
  annual_cost NUMERIC,
  start_date DATE,
  end_date DATE,
  lock_in_risk TEXT DEFAULT 'medium',
  renewal_type TEXT DEFAULT 'manual',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read contracts" ON public.contracts FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Systems
-- ============================================================
CREATE TABLE public.systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_title TEXT,
  department TEXT,
  org_id TEXT REFERENCES public.organizations(id) NOT NULL,
  domain TEXT,
  lifecycle system_lifecycle NOT NULL DEFAULT 'active',
  criticality criticality_level NOT NULL DEFAULT 'medium',
  annual_cost NUMERIC DEFAULT 0,
  maintenance_cost NUMERIC DEFAULT 0,
  development_cost NUMERIC DEFAULT 0,
  vendor_id TEXT REFERENCES public.vendors(id),
  vendor_name TEXT,
  contract_end DATE,
  lock_in_risk TEXT DEFAULT 'medium',
  api_reuse_potential TEXT DEFAULT 'medium',
  replacement_priority TEXT DEFAULT 'none',
  dependencies TEXT[] DEFAULT '{}',
  downstream_services TEXT[] DEFAULT '{}',
  standards_used TEXT[] DEFAULT '{}',
  linked_gov_docs TEXT[] DEFAULT '{}',
  last_review_date DATE,
  description TEXT,
  x NUMERIC DEFAULT 0,
  y NUMERIC DEFAULT 0,
  visibility visibility_level NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read systems" ON public.systems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public users can read public systems" ON public.systems FOR SELECT TO anon USING (visibility = 'public');

ALTER TABLE public.contracts ADD CONSTRAINT contracts_system_fk FOREIGN KEY (system_id) REFERENCES public.systems(id);

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON public.systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- APIs
-- ============================================================
CREATE TABLE public.apis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type api_type NOT NULL DEFAULT 'internal',
  linked_system_id TEXT REFERENCES public.systems(id),
  protocol TEXT DEFAULT 'REST',
  description TEXT,
  endpoint TEXT,
  version TEXT DEFAULT 'v1',
  authentication TEXT,
  rate_limit_per_min INTEGER DEFAULT 100,
  problems_solved TEXT[] DEFAULT '{}',
  org_id TEXT REFERENCES public.organizations(id),
  visibility visibility_level NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read apis" ON public.apis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public users can read public apis" ON public.apis FOR SELECT TO anon USING (visibility = 'public');

CREATE TRIGGER update_apis_updated_at BEFORE UPDATE ON public.apis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Risks
-- ============================================================
CREATE TABLE public.risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type risk_type NOT NULL,
  linked_system_id TEXT REFERENCES public.systems(id),
  linked_dependency TEXT,
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  affected_services TEXT[] DEFAULT '{}',
  owner TEXT NOT NULL,
  mitigation TEXT,
  due_date DATE,
  escalation_status escalation_status DEFAULT 'none',
  board_visibility BOOLEAN DEFAULT false,
  last_updated DATE,
  source TEXT,
  category TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read risks" ON public.risks FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Governance Documents
-- ============================================================
CREATE TABLE public.governance_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_title TEXT,
  unit TEXT,
  classification gov_classification NOT NULL DEFAULT 'Operational',
  category TEXT,
  review_date DATE,
  status gov_doc_status NOT NULL DEFAULT 'Active',
  replaces_doc_id TEXT,
  org_id TEXT REFERENCES public.organizations(id),
  created_date DATE,
  security_checks JSONB DEFAULT '{}',
  linked_standards TEXT[] DEFAULT '{}',
  linked_core_systems TEXT[] DEFAULT '{}',
  escalated_to_board BOOLEAN DEFAULT false,
  strategic_goals TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  domain TEXT,
  has_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read gov docs" ON public.governance_documents FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_gov_docs_updated_at BEFORE UPDATE ON public.governance_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Governance Contradictions
-- ============================================================
CREATE TABLE public.governance_contradictions (
  id TEXT PRIMARY KEY,
  doc_a_id TEXT REFERENCES public.governance_documents(id),
  doc_b_id TEXT REFERENCES public.governance_documents(id),
  description TEXT NOT NULL,
  explanation TEXT,
  severity TEXT DEFAULT 'Medium',
  resolved BOOLEAN DEFAULT false,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_contradictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read contradictions" ON public.governance_contradictions FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Governance Standards
-- ============================================================
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
CREATE POLICY "Authenticated users can read standards" ON public.governance_standards FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Knowledge Hub - Ideas
-- ============================================================
CREATE TABLE public.knowledge_ideas (
  id TEXT PRIMARY KEY DEFAULT 'idea-' || gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  contact_name TEXT,
  contact_email TEXT,
  date_submitted DATE DEFAULT CURRENT_DATE,
  status idea_status DEFAULT 'awaiting-review',
  fast_track BOOLEAN DEFAULT false,
  fast_track_answers JSONB,
  classification knowledge_classification DEFAULT 'innovation',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read ideas" ON public.knowledge_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ideas" ON public.knowledge_ideas FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Knowledge Hub - Experiments
-- ============================================================
CREATE TABLE public.knowledge_experiments (
  id TEXT PRIMARY KEY,
  idea_id TEXT,
  title TEXT NOT NULL,
  owner TEXT,
  department TEXT,
  started_weeks_ago INTEGER DEFAULT 0,
  timebox_weeks INTEGER DEFAULT 10,
  progress_percent INTEGER DEFAULT 0,
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
  classification knowledge_classification DEFAULT 'innovation',
  visibility visibility_level DEFAULT 'internal',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read experiments" ON public.knowledge_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public can read public experiments" ON public.knowledge_experiments FOR SELECT TO anon USING (visibility = 'public');

-- ============================================================
-- Knowledge Hub - Published Tools
-- ============================================================
CREATE TABLE public.knowledge_published_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  status TEXT DEFAULT 'Active',
  apis TEXT[] DEFAULT '{}',
  classification knowledge_classification DEFAULT 'innovation',
  visibility visibility_level DEFAULT 'internal',
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_published_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read tools" ON public.knowledge_published_tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public can read public tools" ON public.knowledge_published_tools FOR SELECT TO anon USING (visibility = 'public');

-- ============================================================
-- KPI Values
-- ============================================================
CREATE TABLE public.kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  trend TEXT DEFAULT 'stable',
  trend_label TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  source TEXT,
  helper TEXT,
  link_to TEXT,
  role app_role,
  org_id TEXT REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read kpis" ON public.kpi_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public can read public kpis" ON public.kpi_values FOR SELECT TO anon USING (role = 'public');

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
