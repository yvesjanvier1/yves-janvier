
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TechStackFieldProps {
  techStack: string[];
  onAddTech: (tech: string) => void;
  onRemoveTech: (tech: string) => void;
}

export function TechStackField({ techStack, onAddTech, onRemoveTech }: TechStackFieldProps) {
  const [techInput, setTechInput] = useState("");
  
  const handleAddTechnology = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      onAddTech(techInput.trim());
      setTechInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tech_stack">Technologies Used</Label>
      <div className="flex gap-2">
        <Input
          id="techInput"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          placeholder="Add technology"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTechnology();
            }
          }}
        />
        <Button type="button" onClick={handleAddTechnology}>Add</Button>
      </div>
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map((tech, index) => (
            <div key={index} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => onRemoveTech(tech)}
                className="text-muted-foreground hover:text-destructive"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
