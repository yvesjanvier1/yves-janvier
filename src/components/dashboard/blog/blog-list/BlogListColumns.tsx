
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  tags: string[];
}

interface ColumnConfig {
  key: string;
  header: string;
  cell: (post: BlogPost) => React.ReactNode;
}

interface BlogListColumnsProps {
  onDeleteClick: (id: string) => void;
}

export function getBlogListColumns({ onDeleteClick }: BlogListColumnsProps): ColumnConfig[] {
  return [
    {
      key: "title",
      header: "Title",
      cell: (post: BlogPost) => <span className="font-medium">{post.title}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (post: BlogPost) => post.slug,
    },
    {
      key: "tags",
      header: "Tags",
      cell: (post: BlogPost) => (
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
      cell: (post: BlogPost) => (
        <Badge variant={post.published ? "default" : "secondary"}>
          {post.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (post: BlogPost) => new Date(post.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (post: BlogPost) => (
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
