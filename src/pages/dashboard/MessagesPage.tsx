
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Search, CheckCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
      toast.success("Message deleted successfully");
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
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
      
      {isLoading ? (
        <div className="text-center py-10">Loading messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchQuery ? "No messages match your search" : "No contact messages found yet."}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} className={message.read ? "" : "bg-muted/30"}>
                  <TableCell>
                    <Badge variant={message.read ? "outline" : "default"}>
                      {message.read ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>
                    <a 
                      href={`mailto:${message.email}`} 
                      className="text-blue-500 hover:underline"
                    >
                      {message.email}
                    </a>
                  </TableCell>
                  <TableCell>{message.subject || "(No subject)"}</TableCell>
                  <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
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
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
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
                onClick={() => handleDeleteMessage(selectedMessage.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default MessagesPage;
