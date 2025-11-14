import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "./security";

/**
 * Standardized Supabase data validation and formatting utilities
 * Ensures all data is properly typed before hitting the Supabase SDK
 */

// Slug sanitization
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/['']/g, "-") // Replace apostrophes
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}

// Array sanitization - ensures clean string arrays for Postgres
export function sanitizeStringArray(arr: any[]): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .map((item) => String(item))
    .map((item) => item.replace(/[{}"]/g, "").trim()) // Remove Postgres array chars
    .filter(Boolean); // Remove empty strings
}

// Boolean normalization
export function normalizeBoolean(value: any): boolean {
  return !!value;
}

// JSON field validation
export function validateJsonField(value: any): any {
  if (value === null || value === undefined) return null;
  
  // If it's already an object/array, ensure it's serializable
  try {
    JSON.parse(JSON.stringify(value));
    return value;
  } catch {
    console.error("Invalid JSON field:", value);
    return null;
  }
}

/**
 * Blog Post Data Formatter
 */
export interface BlogPostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published?: boolean;
  tags?: any[];
  locale?: string;
}

export function formatBlogPostData(data: BlogPostInput) {
  return {
    title: data.title.trim(),
    slug: data.slug ? sanitizeSlug(data.slug) : sanitizeSlug(data.title),
    content: sanitizeHtml(data.content),
    excerpt: data.excerpt?.trim() || "",
    cover_image: data.cover_image?.trim() || "",
    published: normalizeBoolean(data.published),
    tags: sanitizeStringArray(data.tags || []),
    locale: data.locale || "fr",
  };
}

/**
 * Portfolio Project Data Formatter
 */
export interface PortfolioProjectInput {
  title: string;
  slug?: string;
  description: string;
  category?: string;
  tech_stack?: any[];
  images?: any[];
  links?: any;
  featured?: boolean;
  locale?: string;
}

export function formatPortfolioProjectData(data: PortfolioProjectInput) {
  return {
    title: data.title.trim(),
    slug: data.slug ? sanitizeSlug(data.slug) : sanitizeSlug(data.title),
    description: data.description.trim(),
    category: data.category?.trim() || "",
    tech_stack: sanitizeStringArray(data.tech_stack || []),
    images: sanitizeStringArray(data.images || []),
    links: validateJsonField(data.links) || [],
    featured: normalizeBoolean(data.featured),
    locale: data.locale || "fr",
  };
}

/**
 * Generic CRUD wrapper with automatic error handling
 */
export async function supabaseInsert<T>(
  table: string,
  data: any,
  formatter?: (data: any) => any
) {
  try {
    const formattedData = formatter ? formatter(data) : data;
    
    const { data: result, error } = await (supabase as any)
      .from(table)
      .insert([formattedData])
      .select()
      .single();

    if (error) throw error;
    return result as T;
  } catch (error: any) {
    console.error(`Supabase insert error (${table}):`, error);
    
    if (error?.code === "23505") {
      throw new Error("A record with this slug already exists. Please use a different slug.");
    }
    
    throw new Error(error?.message || `Failed to create ${table} record`);
  }
}

export async function supabaseUpdate<T>(
  table: string,
  id: string,
  data: any,
  formatter?: (data: any) => any
) {
  try {
    const formattedData = formatter ? formatter(data) : data;
    
    const { data: result, error } = await (supabase as any)
      .from(table)
      .update({
        ...formattedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  } catch (error: any) {
    console.error(`Supabase update error (${table}):`, error);
    
    if (error?.code === "23505") {
      throw new Error("A record with this slug already exists. Please use a different slug.");
    }
    
    throw new Error(error?.message || `Failed to update ${table} record`);
  }
}

export async function supabaseDelete(table: string, id: string) {
  try {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);

    if (error) throw error;
  } catch (error: any) {
    console.error(`Supabase delete error (${table}):`, error);
    throw new Error(error?.message || `Failed to delete ${table} record`);
  }
}
