
import { Eye, Trash2, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactMessage } from "./message-list";

interface MessageColumnProps {
  onViewMessage: (message: ContactMessage) => void;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, currentReadStatus: boolean) => void;
}

export function getMessageColumns({ 
  onViewMessage, 
  onDelete, 
  onToggleRead 
}: MessageColumnProps) {
  return [
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
            onClick={() => onToggleRead(message.id, message.read)}
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
            onClick={() => onViewMessage(message)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
