
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const skills = [
  { category: "Programming Languages", items: ["Python", "JavaScript/TypeScript", "SQL", "R"] },
  { category: "Data & Analytics", items: ["Machine Learning", "Data Visualization", "Statistical Analysis", "Big Data"] },
  { category: "Web Development", items: ["React", "Node.js", "Next.js", "RESTful APIs"] },
  { category: "Cloud & DevOps", items: ["AWS", "Docker", "CI/CD", "Kubernetes"] },
  { category: "Soft Skills", items: ["Project Management", "Team Leadership", "Client Communication", "Strategic Thinking"] }
];

const timeline = [
  {
    year: "2022 - Present",
    role: "Data & Technology Consultant",
    company: "Independent",
    description: "Providing expert consultation to businesses on data strategy, analytics implementation, and technology solutions."
  },
  {
    year: "2019 - 2022",
    role: "Lead Data Scientist",
    company: "InnovateTech Solutions",
    description: "Led a team of data scientists in developing machine learning models for client projects across financial services and healthcare sectors."
  },
  {
    year: "2017 - 2019",
    role: "Senior Software Engineer",
    company: "DataFlow Systems",
    description: "Developed scalable web applications and data processing pipelines for enterprise clients."
  },
  {
    year: "2014 - 2017",
    role: "Data Analyst",
    company: "FinTech Innovations",
    description: "Analyzed financial data and created reports and dashboards to support strategic business decisions."
  }
];

const AboutPage = () => {
  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <SectionHeader 
            title="About Me"
            subtitle="Learn more about my background, skills, and expertise"
          />
          
          <div className="space-y-6 text-lg">
            <p>
              I'm Yves Janvier, a data and technology specialist with over 8 years of experience transforming 
              complex data into actionable insights and building innovative tech solutions for businesses.
            </p>
            <p>
              My passion lies at the intersection of data science, software engineering, and business strategy. 
              I specialize in helping organizations leverage their data assets and implement technology solutions 
              that drive measurable results.
            </p>
            <p>
              Throughout my career, I've worked with startups, enterprise organizations, and government agencies 
              to develop data strategies, build analytical tools, and implement custom software solutions that 
              address complex business challenges.
            </p>
            <p>
              When I'm not working with data or code, you can find me exploring the latest tech trends, 
              contributing to open-source projects, or sharing knowledge through my blog and speaking engagements.
            </p>
          </div>
          
          <div className="mt-8">
            <Button className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>
        </div>
        
        <div>
          <div className="aspect-square rounded-lg overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3" 
              alt="Yves Janvier"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              GitHub
            </a>
            <a 
              href="mailto:contact@yvesjanvier.com" 
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              Email Me
            </a>
          </div>
        </div>
      </div>
      
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Technical Skills & Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup) => (
            <div 
              key={skillGroup.category} 
              className="bg-card border rounded-lg p-6"
            >
              <h3 className="font-semibold text-lg mb-3">{skillGroup.category}</h3>
              <ul className="space-y-2">
                {skillGroup.items.map((skill) => (
                  <li key={skill} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-8">Professional Journey</h2>
        
        <div className="space-y-8">
          {timeline.map((item, index) => (
            <div key={index} className="relative pl-8 pb-8 border-l border-border">
              <div className="absolute left-0 top-0 w-4 h-4 bg-primary rounded-full -translate-x-2"></div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">{item.year}</div>
              <h3 className="text-lg font-semibold">{item.role}</h3>
              <div className="text-primary font-medium mb-2">{item.company}</div>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
