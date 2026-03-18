ALTER TABLE public.knowledge_ideas
  ADD COLUMN IF NOT EXISTS fast_track_answers JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approval_comment TEXT,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE POLICY "Ideas updatable by authenticated"
  ON public.knowledge_ideas FOR UPDATE TO authenticated USING (true);