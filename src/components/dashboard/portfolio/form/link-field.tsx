
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Plus, Trash2 } from "lucide-react";

interface ProjectLink {
  title: string;
  url: string;
}

interface LinkFieldProps {
  links: ProjectLink[];
  onAddLink: (link: ProjectLink) => void;
  onRemoveLink: (link: ProjectLink) => void;
}

export function LinkField({ links, onAddLink, onRemoveLink }: LinkFieldProps) {
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  
  const handleAddLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      onAddLink({ title: linkTitle.trim(), url: linkUrl.trim() });
      setLinkTitle("");
      setLinkUrl("");
    }
  };

  return (
    <div className="space-y-2">
      <Label>Links</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
          placeholder="Link title (e.g. GitHub, Demo)"
        />
        <div className="flex gap-2">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL (https://...)"
          />
          <Button type="button" onClick={handleAddLink} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {links.length > 0 && (
        <div className="space-y-2 mt-2">
          {links.map((link, index) => (
            <div key={index} className="flex items-center justify-between bg-muted rounded-md p-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span className="font-medium">{link.title}:</span>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline truncate max-w-[200px]"
                >
                  {link.url}
                </a>
              </div>
              <button
                type="button"
                onClick={() => onRemoveLink(link)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
