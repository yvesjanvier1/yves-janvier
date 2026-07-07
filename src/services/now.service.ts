import { supabase } from "@/integrations/supabase/client";

export interface NowPageRow {
  id: string;
  working_on: any;
  currently_learning: any;
  using_right_now: any;
  listening_to: any;
  last_updated: string;
  updated_at?: string;
}

export const nowService = {
  async getLatest(): Promise<NowPageRow | null> {
    const { data, error } = await supabase
      .from("now_page")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as NowPageRow) ?? null;
  },

  async update(id: string, payload: Record<string, any>) {
    const { error } = await supabase.from("now_page").update(payload).eq("id", id);
    if (error) throw error;
  },

  async insert(payload: Record<string, any>) {
    const { error } = await (supabase.from("now_page") as any).insert(payload);
    if (error) throw error;
  },
};
