
-- Add locale column to all content tables
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr' CHECK (locale IN ('en', 'fr', 'ht'));
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr' CHECK (locale IN ('en', 'fr', 'ht'));
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr' CHECK (locale IN ('en', 'fr', 'ht'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr' CHECK (locale IN ('en', 'fr', 'ht'));
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr' CHECK (locale IN ('en', 'fr', 'ht'));

-- Backfill existing data with default locale (fr)
UPDATE blog_posts SET locale = 'fr' WHERE locale IS NULL;
UPDATE portfolio_projects SET locale = 'fr' WHERE locale IS NULL;
UPDATE testimonials SET locale = 'fr' WHERE locale IS NULL;
UPDATE services SET locale = 'fr' WHERE locale IS NULL;
UPDATE journal_entries SET locale = 'fr' WHERE locale IS NULL;

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_locale ON portfolio_projects(locale);
CREATE INDEX IF NOT EXISTS idx_testimonials_locale ON testimonials(locale);
CREATE INDEX IF NOT EXISTS idx_services_locale ON services(locale);
CREATE INDEX IF NOT EXISTS idx_journal_entries_locale ON journal_entries(locale);

-- Update RLS policies to allow public access by locale for blog posts and portfolio
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts 
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Anyone can view portfolio projects" ON portfolio_projects;  
CREATE POLICY "Anyone can view portfolio projects" ON portfolio_projects
  FOR SELECT USING (true);
