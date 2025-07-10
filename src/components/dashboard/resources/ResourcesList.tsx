import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Download, 
  FileText, 
  Video, 
  Book,
  Star,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  tags: string[];
  featured: boolean;
  download_count: number;
  created_at: string;
}

interface ResourcesListProps {
  resources: Resource[];
  isLoading: boolean;
  onRefetch: () => void;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
      return Video;
    case 'book':
    case 'epub':
      return Book;
    default:
      return FileText;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function ResourcesList({ resources, isLoading, onRefetch }: ResourcesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const queryClient = useQueryClient();

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-resources"] });
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
      onRefetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resource",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (resourceToDelete) {
      deleteResourceMutation.mutate(resourceToDelete.id);
    }
  };

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No resources found</h3>
        <p className="text-muted-foreground mb-4">
          Start by creating your first downloadable resource.
        </p>
        <Button asChild>
          <Link to="/dashboard/resources/new">Create Resource</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => {
              const FileIcon = getFileIcon(resource.file_type);
              return (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      <FileIcon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium line-clamp-1">{resource.title}</p>
                          {resource.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        {resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {resource.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{resource.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.file_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    {resource.category && (
                      <Badge variant="outline">{resource.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      {resource.download_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    {resource.file_size ? formatFileSize(resource.file_size) : '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(resource.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a 
                            href={resource.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View File
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/resources/edit/${resource.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(resource)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resourceToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        destructive={true}
      />
    </>
  );
}