
-- Risk score history table
CREATE TABLE public.risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL REFERENCES public.risks(id),
  org_id TEXT REFERENCES public.organizations(id),
  score INTEGER NOT NULL,
  recorded_at DATE NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History readable by authenticated" ON public.risk_score_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "History insertable by authenticated" ON public.risk_score_history FOR INSERT TO authenticated WITH CHECK (true);

-- Risk-to-risk dependency links
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS linked_risk_ids TEXT DEFAULT '';

-- Org risk appetite threshold
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS risk_appetite_threshold INTEGER NOT NULL DEFAULT 16;

-- Governance audit tracking
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS last_audit_date DATE;

-- RLS: allow authenticated UPDATE on organizations (for audit date + threshold)
CREATE POLICY "Orgs updatable by authenticated" ON public.organizations FOR UPDATE TO authenticated USING (true);

-- RLS: allow authenticated UPDATE on risks (for linked_risk_ids)
CREATE POLICY "Risks updatable by authenticated" ON public.risks FOR UPDATE TO authenticated USING (true);

-- RLS: allow DELETE on knowledge_ideas by authenticated
CREATE POLICY "Ideas deletable by authenticated" ON public.knowledge_ideas FOR DELETE TO authenticated USING (true);
