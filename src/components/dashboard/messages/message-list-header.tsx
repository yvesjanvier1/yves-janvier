
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MessageListHeaderProps {
  unreadCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MessageListHeader({ 
  unreadCount, 
  searchQuery, 
  onSearchChange 
}: MessageListHeaderProps) {
  return (
    <>
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
