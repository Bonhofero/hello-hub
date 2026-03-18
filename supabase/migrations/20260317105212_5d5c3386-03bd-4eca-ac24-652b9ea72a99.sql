
-- New table: opportunity_cost_items
CREATE TABLE public.opportunity_cost_items (
  id text PRIMARY KEY,
  function_name text NOT NULL,
  linked_api_id text,
  linked_system_id text,
  your_cost numeric NOT NULL DEFAULT 0,
  peer_average_cost numeric NOT NULL DEFAULT 0,
  peer_count integer NOT NULL DEFAULT 0,
  potential_saving numeric GENERATED ALWAYS AS (your_cost - peer_average_cost) STORED,
  adopted boolean NOT NULL DEFAULT false,
  org_id text REFERENCES public.organizations(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_cost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunity cost readable by authenticated"
  ON public.opportunity_cost_items FOR SELECT TO authenticated
  USING (true);

-- Alter systems: add internet_facing and previous_risk_score
ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS internet_facing boolean NOT NULL DEFAULT false;
ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS previous_risk_score integer;

-- Alter risks: add previous_score, likelihood_override, impact_override
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS previous_score integer;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS likelihood_override integer;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS impact_override integer;

-- Alter knowledge_experiments: add fast track fields
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS fast_track boolean NOT NULL DEFAULT false;
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS sandbox_start_date text;
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS sandbox_weeks integer NOT NULL DEFAULT 10;
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS approver text;
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS exit_log_approved boolean NOT NULL DEFAULT false;
ALTER TABLE public.knowledge_experiments ADD COLUMN IF NOT EXISTS outcome_routing text;
