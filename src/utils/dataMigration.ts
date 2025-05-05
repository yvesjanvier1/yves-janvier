
import { supabase } from "@/integrations/supabase/client";
import { blogPosts } from "@/data/blog-posts";
import { projects } from "@/data/projects";

export async function migrateDataToSupabase() {
  try {
    // Migrate blog posts
    console.log("Starting blog posts migration...");
    
    for (const post of blogPosts) {
      // Convert blog post to the format expected by Supabase
      const supabasePost = {
        title: post.title,
        slug: post.id,
        content: post.content,
        excerpt: post.excerpt,
        cover_image: post.coverImage,
        tags: post.tags,
        created_at: post.date,
        published: true,
        author_id: null, // No author_id in local data
      };
      
      // Check if post already exists
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", post.id)
        .single();
      
      if (!existingPost) {
        // Insert new post
        const { error } = await supabase
          .from("blog_posts")
          .insert([supabasePost]);
          
        if (error) throw error;
        console.log(`Migrated blog post: ${post.title}`);
      } else {
        console.log(`Blog post already exists: ${post.title}`);
      }
    }
    
    // Migrate portfolio projects
    console.log("Starting portfolio projects migration...");
    
    for (const project of projects) {
      // Convert project to the format expected by Supabase
      const supabaseProject = {
        title: project.title,
        slug: project.id,
        description: project.description,
        category: project.categories[0] || null,
        tech_stack: project.tools,
        featured: project.featured,
        created_at: project.date,
        images: [project.coverImage],
        links: project.links || []
      };
      
      // Check if project already exists
      const { data: existingProject } = await supabase
        .from("portfolio_projects")
        .select("id")
        .eq("slug", project.id)
        .single();
      
      if (!existingProject) {
        // Insert new project
        const { error } = await supabase
          .from("portfolio_projects")
          .insert([supabaseProject]);
          
        if (error) throw error;
        console.log(`Migrated project: ${project.title}`);
      } else {
        console.log(`Project already exists: ${project.title}`);
      }
    }
    
    console.log("Data migration completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error during data migration:", error);
    return { success: false, error };
  }
}
