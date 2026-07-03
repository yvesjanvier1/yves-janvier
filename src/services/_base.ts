import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Generic thin data-access layer over Supabase for a single public table.
 *
 * Goal: get UI components out of the business of writing `supabase.from(...)`
 * calls directly so we can later swap the transport, add caching, or add
 * validation in one place.
 *
 * Each service exposes the same 5 CRUD verbs: list / get / create / update / remove.
 * Keep them intentionally boring — no business logic, no toasts, no navigation.
 */

type PublicTables = Database["public"]["Tables"];
type TableName = keyof PublicTables;

type RowOf<T extends TableName> = PublicTables[T]["Row"];
type InsertOf<T extends TableName> = PublicTables[T]["Insert"];
type UpdateOf<T extends TableName> = PublicTables[T]["Update"];

export interface ListOptions {
  /** Column to order by. */
  orderBy?: string;
  /** Order direction. Defaults to descending. */
  ascending?: boolean;
  /** Max rows returned. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
}

export interface CrudService<T extends TableName> {
  list(options?: ListOptions): Promise<RowOf<T>[]>;
  get(id: string): Promise<RowOf<T> | null>;
  create(dto: InsertOf<T>): Promise<RowOf<T>>;
  update(id: string, dto: UpdateOf<T>): Promise<RowOf<T>>;
  remove(id: string): Promise<void>;
}

/**
 * Build a CRUD service for a given table. The `idColumn` defaults to `"id"`
 * — override it for tables keyed differently.
 */
export function createCrudService<T extends TableName>(
  table: T,
  idColumn: string = "id",
): CrudService<T> {
  return {
    async list(options: ListOptions = {}) {
      const { orderBy = "created_at", ascending = false, limit, offset } = options;
      // Cast to any: the generic table name defeats Supabase's overload inference,
      // but the returned Row type is preserved for consumers.
      let query = (supabase.from(table as string) as any).select("*").order(orderBy, { ascending });
      if (typeof limit === "number") {
        const from = offset ?? 0;
        query = query.range(from, from + limit - 1);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as RowOf<T>[];
    },

    async get(id: string) {
      const { data, error } = await (supabase.from(table as string) as any)
        .select("*")
        .eq(idColumn, id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as RowOf<T> | null;
    },

    async create(dto: InsertOf<T>) {
      const { data, error } = await (supabase.from(table as string) as any)
        .insert(dto as any)
        .select()
        .single();
      if (error) throw error;
      return data as RowOf<T>;
    },

    async update(id: string, dto: UpdateOf<T>) {
      const { data, error } = await (supabase.from(table as string) as any)
        .update(dto as any)
        .eq(idColumn, id)
        .select()
        .single();
      if (error) throw error;
      return data as RowOf<T>;
    },

    async remove(id: string) {
      const { error } = await (supabase.from(table as string) as any)
        .delete()
        .eq(idColumn, id);
      if (error) throw error;
    },
  };
}
