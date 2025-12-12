-- Baseline schema for leads table
-- Created: 2025-01-XX
--
-- For existing production databases:
--   This migration is idempotent (IF NOT EXISTS).
--   If leads table already exists, this will be a no-op.
--   Run 001-add-lead-columns.sql for schema drift reconciliation if needed.

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh', 'es', 'ar')),
  name TEXT NOT NULL CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
  email TEXT NOT NULL CHECK (LENGTH(email) >= 5 AND LENGTH(email) <= 254),
  phone TEXT CHECK (phone IS NULL OR LENGTH(phone) <= 20),
  company TEXT CHECK (company IS NULL OR LENGTH(company) <= 200),
  inquiry_type TEXT CHECK (inquiry_type IS NULL OR inquiry_type IN ('product', 'agency', 'other')),
  product_slug TEXT CHECK (product_slug IS NULL OR LENGTH(product_slug) <= 200),
  product_name TEXT CHECK (product_name IS NULL OR LENGTH(product_name) <= 200),
  form_page TEXT CHECK (form_page IS NULL OR LENGTH(form_page) <= 500),
  message TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed'))
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
