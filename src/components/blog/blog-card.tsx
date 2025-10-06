import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const { t, i18n } = useTranslation(["common", "blog"]);

  return (
    <div className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <Link to={`/blog/${post.slug}`} className="aspect-video relative overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags && post.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Date */}
        <time className="text-sm text-muted-foreground block mb-2">
          {formatDate(post.date, i18n.language)}
        </time>

        {/* Title */}
        <Link to={`/blog/${post.slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-semibold text-xl mb-2">{post.title}</h3>
        </Link>

        {/* Excerpt */}
        <p className="text-muted-foreground flex-grow mb-4">{post.excerpt}</p>

        {/* Read More */}
        <Link 
          to={`/blog/${post.slug}`}
          className="text-primary font-medium hover:underline"
        >
          {t("blog.readMore")}
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
