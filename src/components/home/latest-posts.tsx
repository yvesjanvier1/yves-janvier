
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { blogPosts } from "@/data/blog-posts";
import { formatDate } from "@/lib/utils";

const LatestPosts = () => {
  // Get latest 3 posts
  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Latest from the Blog"
          subtitle="Insights, tutorials, and thoughts on data and tech"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <div 
              key={post.id} 
              className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <time className="text-sm text-muted-foreground block mb-2">
                  {formatDate(post.date)}
                </time>
                <h3 className="font-semibold text-xl mb-2">{post.title}</h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                <Link 
                  to={`/blog/${post.id}`}
                  className="text-primary font-medium inline-flex items-center hover:underline"
                >
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
