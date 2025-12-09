-- Add new columns to leads table for Phase 2
ALTER TABLE leads ADD COLUMN inquiry_type TEXT;
ALTER TABLE leads ADD COLUMN product_slug TEXT;
ALTER TABLE leads ADD COLUMN product_name TEXT;
ALTER TABLE leads ADD COLUMN form_page TEXT;
