
-- Fix the permissive INSERT policy on knowledge_ideas to scope by org
DROP POLICY "Authenticated users can insert ideas" ON public.knowledge_ideas;
CREATE POLICY "Authenticated users can insert ideas" ON public.knowledge_ideas 
  FOR INSERT TO authenticated 
  WITH CHECK (
    org_id IN (SELECT p.org_id FROM public.profiles p WHERE p.user_id = auth.uid())
  );
