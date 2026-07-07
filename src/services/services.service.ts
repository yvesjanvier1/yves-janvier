import { supabase } from "@/integrations/supabase/client";
import { createCrudService } from "./_base";

const base = createCrudService("services");

export interface ListPublicOptions {
  locale: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
}

export const servicesService = {
  ...base,

  async listPublic({ locale, filters = {}, orderBy }: ListPublicOptions) {
    await (supabase.rpc as any)("set_current_locale", { _locale: locale });

    let query: any = supabase.from("services").select("*");
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.eq(k, v);
    });
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as any[];
  },
};
