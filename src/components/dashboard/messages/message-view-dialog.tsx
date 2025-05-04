
import { Mail, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContactMessage } from "./message-list";

interface MessageViewDialogProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
}

export function MessageViewDialog({ 
  message, 
  open, 
  onOpenChange, 
  onDelete 
}: MessageViewDialogProps) {
  if (!message) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject || "(No subject)"}</DialogTitle>
          <DialogDescription>
            From {message.name} ({message.email}) on{' '}
            {new Date(message.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
            {message.message}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <a 
            href={`mailto:${message.email}?subject=Re: ${message.subject || ''}`}
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
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
