
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface ImageFieldProps {
  images: string[];
  onAddImage: (image: string) => void;
  onRemoveImage: (image: string) => void;
}

export function ImageField({ images, onAddImage, onRemoveImage }: ImageFieldProps) {
  const [imageInput, setImageInput] = useState("");
  
  const handleAddImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      onAddImage(imageInput.trim());
      setImageInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="images">Images</Label>
      <div className="flex gap-2">
        <Input
          id="imageInput"
          value={imageInput}
          onChange={(e) => setImageInput(e.target.value)}
          placeholder="Image URL (https://...)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddImage();
            }
          }}
        />
        <Button type="button" onClick={handleAddImage}>Add</Button>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group rounded-md overflow-hidden">
              <img
                src={image}
                alt={`Project image ${index + 1}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                }}
              />
              <button
                type="button"
                onClick={() => onRemoveImage(image)}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
