import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { createCrudService } from "./_base";

type AboutRow = Database["public"]["Tables"]["about_page"]["Row"];
type AboutInsert = Database["public"]["Tables"]["about_page"]["Insert"];
type AboutUpdate = Database["public"]["Tables"]["about_page"]["Update"];

/**
 * `about_page` is a single-row table. Expose a small dedicated API on top
 * of the generic CRUD helpers used elsewhere.
 */
export const aboutService = {
  async get(): Promise<AboutRow | null> {
    const { data, error } = await supabase
      .from("about_page")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  },

  async update(id: string, dto: AboutUpdate): Promise<AboutRow> {
    const { data, error } = await supabase
      .from("about_page")
      .update(dto)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async create(dto: AboutInsert): Promise<AboutRow> {
    const { data, error } = await supabase
      .from("about_page")
      .insert(dto)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

/** Skills are edited from the About Page dashboard. */
export const skillsService = createCrudService("skills");

/** Experience entries are edited from the About Page dashboard. */
export const experienceService = createCrudService("experience");
