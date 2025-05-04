
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MessageViewDialog } from "./message-view-dialog";
import { getMessageColumns } from "./message-columns";
import { MessageListHeader } from "./message-list-header";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function MessageList() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      toast.error("Failed to fetch contact messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete);
        
      if (error) throw error;
      
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageToDelete));
      toast.success("Message deleted successfully");
      
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setMessageToDelete(null);
    }
  };

  const handleMarkAsRead = async (id: string, currentReadStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read: !currentReadStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { ...message, read: !currentReadStatus } : message
        )
      );
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: !currentReadStatus });
      }
      
      toast.success(`Message marked as ${!currentReadStatus ? 'read' : 'unread'}`);
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    
    // If message is unread, mark it as read
    if (!message.read) {
      handleMarkAsRead(message.id, false);
    }
  };

  const filteredMessages = messages.filter(message => 
    message.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (message.subject && message.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    message.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(message => !message.read).length;
  
  const columns = getMessageColumns({
    onViewMessage: handleViewMessage,
    onDelete: (id) => setMessageToDelete(id),
    onToggleRead: handleMarkAsRead
  });

  return (
    <div className="space-y-6">
      <MessageListHeader 
        unreadCount={unreadCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <DataTable 
        columns={columns} 
        data={filteredMessages} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No messages match your search" : "No contact messages found yet."}
      />
      
      <MessageViewDialog
        message={selectedMessage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={setMessageToDelete}
      />
      
      <ConfirmDialog
        open={!!messageToDelete}
        onOpenChange={(isOpen) => !isOpen && setMessageToDelete(null)}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteMessage}
        destructive
      />
    </div>
  );
}
