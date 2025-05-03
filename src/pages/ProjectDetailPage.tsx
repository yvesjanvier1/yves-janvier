
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="container px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="mb-6">Sorry, the project you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-16 mx-auto">
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.categories.map((category) => (
            <span 
              key={category} 
              className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        
        <p className="text-muted-foreground mb-8">
          Completed on {formatDate(project.date)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden border mb-8">
            <img 
              src={project.coverImage} 
              alt={project.title}
              className="w-full h-auto"
            />
          </div>
          
          <div className="prose max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
            <p className="mb-6">{project.description}</p>
            
            {project.caseStudy && (
              <>
                <h2 className="text-2xl font-semibold mt-12 mb-4">Case Study</h2>
                
                <h3 className="text-xl font-semibold mt-8 mb-2">The Challenge</h3>
                <p className="mb-6">{project.caseStudy.challenge}</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-2">The Solution</h3>
                <p className="mb-6">{project.caseStudy.solution}</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-2">The Results</h3>
                <p className="mb-6">{project.caseStudy.results}</p>
              </>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-card border rounded-lg p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Technologies & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <span 
                    key={tool} 
                    className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            
            {project.links && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Project Links</h3>
                
                {project.links.live && (
                  <div>
                    <a 
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block w-full text-center py-2 border border-input rounded-md"
                    >
                      View Live Project
                    </a>
                  </div>
                )}
                
                {project.links.github && (
                  <div>
                    <a 
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block w-full text-center py-2 border border-input rounded-md"
                    >
                      View Source Code
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
