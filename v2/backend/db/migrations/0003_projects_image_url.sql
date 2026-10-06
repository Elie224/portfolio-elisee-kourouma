ALTER TABLE projects ADD COLUMN image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_status_featured_order
ON projects(status, featured, order_index, published_at);
