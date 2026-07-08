import { supabase } from "@/integrations/supabase/client";
import { createCrudService } from "./_base";

const base = createCrudService("contact_messages");

export const messagesService = {
  ...base,

  async markRead(id: string, read: boolean) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read })
      .eq("id", id);
    if (error) throw error;
  },
};
