
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { TagInput } from "@/components/ui/tag-input";

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
}

export function FormFields({
  formData,
  isEditing,
  handleChange,
  handleSwitchChange,
  handleTitleChange,
  addTag,
  removeTag
}: FormFieldsProps) {
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
        />
      </FormField>
      
      <FormField id="slug" label="Slug" required>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          placeholder="post-url-slug"
        />
      </FormField>
      
      <FormField id="excerpt" label="Excerpt">
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Brief summary of the post"
          rows={2}
        />
      </FormField>
      
      <FormField id="content" label="Content" required>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          placeholder="Post content (Markdown supported)"
          rows={12}
        />
      </FormField>
      
      <FormField id="cover_image" label="Cover Image URL">
        <Input
          id="cover_image"
          name="cover_image"
          value={formData.cover_image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </FormField>
      
      <FormField id="tags" label="Tags">
        <TagInput 
          tags={formData.tags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          placeholder="Add tag"
        />
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
