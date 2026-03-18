
ALTER TABLE public.governance_contradictions 
  ADD COLUMN IF NOT EXISTS rule_conflict text,
  ADD COLUMN IF NOT EXISTS why_matters text,
  ADD COLUMN IF NOT EXISTS review_next text;
