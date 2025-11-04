// Centralized type definitions for portfolio projects

export interface ProjectLink {
  title: string;
  url: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  tech_stack?: string[];
  images?: string[];
  links?: ProjectLink[];
  featured: boolean;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProjectFormData {
  title: string;
  slug: string;
  description: string;
  category?: string;
  tech_stack?: string[];
  images?: string[];
  links?: ProjectLink[];
  featured: boolean;
}

export interface PortfolioProjectListItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  featured: boolean;
  created_at: string;
}
