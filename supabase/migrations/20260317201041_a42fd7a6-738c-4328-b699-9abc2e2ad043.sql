
CREATE TABLE public.citizen_impact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT REFERENCES public.organizations(id),
  score INTEGER NOT NULL,
  accessibility INTEGER NOT NULL,
  time_savings INTEGER NOT NULL,
  engagement INTEGER NOT NULL,
  trust INTEGER NOT NULL,
  equity INTEGER NOT NULL,
  recorded_month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.citizen_impact_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CIS history readable by all"
  ON public.citizen_impact_history FOR SELECT
  TO public USING (true);

CREATE POLICY "CIS history insertable by authenticated"
  ON public.citizen_impact_history FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "CIS history deletable by authenticated"
  ON public.citizen_impact_history FOR DELETE
  TO authenticated USING (true);
