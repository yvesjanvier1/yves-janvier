
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// A very simple markdown renderer for this demo
// In a real app, you'd use a library like react-markdown
const SimpleMarkdown = ({ content }: { content: string }) => {
  // Split content by line breaks
  const lines = content.split('\n');
  
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-3xl font-bold mt-8 mb-6">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-bold mt-6 mb-4">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={i} className="text-xl font-semibold mt-5 mb-3">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={i} className="ml-6 mb-2">{line.substring(2)}</li>;
        } else if (line.trim() === '') {
          return <div key={i} className="h-4"></div>;
        } else {
          return <p key={i} className="mb-4 text-foreground/90">{line}</p>;
        }
      })}
    </div>
  );
};

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const post = blogPosts.find(p => p.id === postId);
  
  if (!post) {
    return (
      <div className="container px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <p className="mb-6">Sorry, the blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }
  
  // Find related posts (posts with at least one matching tag)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);
  
  return (
    <div className="container px-4 py-16 mx-auto">
      <Button asChild variant="outline" className="mb-8">
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center mb-8">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div>
            <span className="block font-medium">{post.author.name}</span>
            <time className="text-sm text-muted-foreground">
              {formatDate(post.date)}
            </time>
          </div>
        </div>
        
        <div className="rounded-lg overflow-hidden mb-10">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-auto"
          />
        </div>
        
        <div className="prose max-w-none dark:prose-invert">
          <SimpleMarkdown content={post.content} />
        </div>
        
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.id}`}
                  className="group"
                >
                  <div className="aspect-video rounded-md overflow-hidden mb-3">
                    <img 
                      src={relatedPost.coverImage} 
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-base group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
