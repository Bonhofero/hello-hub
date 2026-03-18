
-- Add partner/municipality info to APIs
ALTER TABLE apis ADD COLUMN developer_municipality text;
ALTER TABLE apis ADD COLUMN developer_contact text;

-- Add municipality and experiment link to published tools
ALTER TABLE knowledge_published_tools ADD COLUMN municipality_name text;
ALTER TABLE knowledge_published_tools ADD COLUMN contact_email text;
ALTER TABLE knowledge_published_tools ADD COLUMN linked_experiment_id text;

-- Add peer breakdown to opportunity cost
ALTER TABLE opportunity_cost_items ADD COLUMN peer_details jsonb DEFAULT '[]'::jsonb;
