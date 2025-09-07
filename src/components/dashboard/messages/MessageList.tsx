
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Eye, Trash2, Search, CheckCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function MessageList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['contact_messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactMessage[];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete);
        
      if (error) throw error;
      
      await refetch();
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
      
      await refetch();
      
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

  const columns = [
    {
      key: "status",
      header: "Status",
      cell: (message: ContactMessage) => (
        <Badge variant={message.read ? "outline" : "default"}>
          {message.read ? "Read" : "New"}
        </Badge>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (message: ContactMessage) => <span className="font-medium">{message.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (message: ContactMessage) => (
        <a 
          href={`mailto:${message.email}`} 
          className="text-blue-500 hover:underline"
        >
          {message.email}
        </a>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (message: ContactMessage) => message.subject || "(No subject)",
    },
    {
      key: "date",
      header: "Date",
      cell: (message: ContactMessage) => new Date(message.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (message: ContactMessage) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleMarkAsRead(message.id, message.read)}
            title={message.read ? "Mark as unread" : "Mark as read"}
          >
            {message.read ? (
              <Mail className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleViewMessage(message)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMessageToDelete(message.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        {unreadCount > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={filteredMessages} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No messages match your search" : "No contact messages found yet."}
      />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedMessage && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject || "(No subject)"}</DialogTitle>
              <DialogDescription>
                From {selectedMessage.name} ({selectedMessage.email}) on{' '}
                {new Date(selectedMessage.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <a 
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || ''}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Reply by Email
                </Button>
              </a>
              <Button 
                variant="destructive" 
                onClick={() => setMessageToDelete(selectedMessage.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
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
