
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { BlogPostListItem } from "@/types/blog";

interface BlogListColumnsProps {
  onDeleteClick: (id: string) => void;
}

export function getBlogListColumns({ onDeleteClick }: BlogListColumnsProps): Array<{
  key: string;
  header: string;
  cell: (post: BlogPostListItem) => React.ReactNode;
}> {
  return [
    {
      key: "title",
      header: "Title",
      cell: (post: BlogPostListItem) => <span className="font-medium">{post.title}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (post: BlogPostListItem) => post.slug,
    },
    {
      key: "tags",
      header: "Tags",
      cell: (post: BlogPostListItem) => (
        <div className="flex flex-wrap gap-1">
          {post.tags && post.tags.map((tag, i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (post: BlogPostListItem) => (
        <Badge variant={post.published ? "default" : "secondary"}>
          {post.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (post: BlogPostListItem) => new Date(post.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (post: BlogPostListItem) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/blog/edit/${post.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(post.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }
  ];
}
