// Centralized type definitions for blog posts

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  tags: string[];
  published: boolean;
  locale: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
  tags: string[];
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  tags: string[];
}
