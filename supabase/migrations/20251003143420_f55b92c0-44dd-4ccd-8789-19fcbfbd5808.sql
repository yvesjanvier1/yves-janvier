-- Seed data for resources table
-- Insert sample downloads
INSERT INTO public.resources (title, description, file_url, file_type, file_size, category, tags, featured)
VALUES 
  ('React Component Library', 'A collection of reusable React components built with TypeScript and Tailwind CSS.', '#', 'ZIP', 2411724, 'downloads', ARRAY['react', 'typescript', 'components'], true),
  ('Project Templates', 'Starter templates for various types of web applications.', '#', 'ZIP', 5349785, 'downloads', ARRAY['templates', 'starter'], false),
  ('UI Design System', 'Complete design system with Figma files and component library.', '#', 'ZIP', 8912345, 'downloads', ARRAY['design', 'ui', 'figma'], false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample guides
INSERT INTO public.resources (title, description, file_url, file_type, file_size, category, tags, featured)
VALUES 
  ('Full-Stack Development Guide', 'Complete guide to building modern web applications with React and Node.js.', '#', 'PDF', 1024000, 'guides', ARRAY['fullstack', 'react', 'nodejs'], true),
  ('API Design Best Practices', 'Learn how to design scalable and maintainable REST APIs.', '#', 'ONLINE', 0, 'guides', ARRAY['api', 'rest', 'design'], true),
  ('Database Optimization Guide', 'Techniques for optimizing database queries and performance.', '#', 'PDF', 2048000, 'guides', ARRAY['database', 'optimization', 'sql'], false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tools
INSERT INTO public.resources (title, description, file_url, file_type, file_size, category, tags, featured)
VALUES 
  ('Development Environment Setup', 'Automated scripts to set up a complete development environment.', '#', 'SCRIPT', 512000, 'tools', ARRAY['devtools', 'setup', 'automation'], true),
  ('Code Quality Tools', 'ESLint, Prettier, and TypeScript configurations for consistent code quality.', '#', 'CONFIG', 102400, 'tools', ARRAY['eslint', 'prettier', 'typescript'], false),
  ('Performance Monitoring Tool', 'Lightweight tool for monitoring app performance and metrics.', '#', 'APP', 3145728, 'tools', ARRAY['monitoring', 'performance', 'metrics'], false)
ON CONFLICT (id) DO NOTHING;