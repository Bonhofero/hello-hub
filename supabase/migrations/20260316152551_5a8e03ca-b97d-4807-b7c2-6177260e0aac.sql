
-- INSERT policy for governance_documents
CREATE POLICY "Authenticated users can insert gov docs"
ON public.governance_documents FOR INSERT TO authenticated
WITH CHECK (true);

-- UPDATE policy for governance_documents (needed to archive replaced docs)
CREATE POLICY "Authenticated users can update gov docs"
ON public.governance_documents FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);
