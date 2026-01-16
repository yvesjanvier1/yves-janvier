import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { TagInput } from "@/components/ui/tag-input";
import { CoverImageGenerator } from "../CoverImageGenerator";
import RichTextEditor from "../RichTextEditor";
import "../RichTextEditor.css";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
  tags: string[];
}

interface FormFieldsProps {
  formData: BlogFormData;
  isEditing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  validationErrors?: Record<string, string>;
  onCoverImageGenerated?: (imageUrl: string) => void;
}

export function FormFields({
  formData,
  isEditing,
  handleChange,
  handleSwitchChange,
  handleTitleChange,
  addTag,
  removeTag,
  validationErrors = {},
  onCoverImageGenerated
}: FormFieldsProps) {
  
  const handleContentChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'content',
        value: value
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

  return (
    <>
      <FormField id="title" label="Title" required>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          required
          placeholder="Post title"
          className={validationErrors.title ? 'border-destructive' : ''}
        />
        {validationErrors.title && (
          <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
        )}
      </FormField>
      
      <FormField id="slug" label="Slug" required>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          placeholder="post-url-slug"
          className={validationErrors.slug ? 'border-destructive' : ''}
        />
        {validationErrors.slug && (
          <p className="text-sm text-destructive mt-1">{validationErrors.slug}</p>
        )}
      </FormField>
      
      <FormField id="excerpt" label="Excerpt">
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Brief summary of the post"
          rows={2}
          className={validationErrors.excerpt ? 'border-destructive' : ''}
        />
        {validationErrors.excerpt && (
          <p className="text-sm text-destructive mt-1">{validationErrors.excerpt}</p>
        )}
      </FormField>
      
      <FormField id="content" label="Content" required>
        <div className={validationErrors.content ? 'border border-destructive rounded-lg' : ''}>
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Start writing your blog post..."
          />
        </div>
        {validationErrors.content && (
          <p className="text-sm text-destructive mt-1">{validationErrors.content}</p>
        )}
      </FormField>
      
      <FormField id="cover_image" label="Cover Image URL">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="cover_image"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              type="url"
              className={`flex-1 ${validationErrors.cover_image ? 'border-destructive' : ''}`}
            />
            {onCoverImageGenerated && (
              <CoverImageGenerator 
                title={formData.title} 
                onImageGenerated={onCoverImageGenerated} 
              />
            )}
          </div>
          {formData.cover_image && (
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img 
                src={formData.cover_image} 
                alt="Cover preview" 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {validationErrors.cover_image && (
            <p className="text-sm text-destructive">{validationErrors.cover_image}</p>
          )}
        </div>
      </FormField>
      
      <FormField id="tags" label="Tags">
        <TagInput 
          tags={formData.tags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          placeholder="Add tag"
        />
        {validationErrors.tags && (
          <p className="text-sm text-destructive mt-1">{validationErrors.tags}</p>
        )}
      </FormField>
      
      <FormField id="published" label="">
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={handleSwitchChange}
          />
          <span>Publish this post</span>
        </div>
      </FormField>
    </>
  );
}
