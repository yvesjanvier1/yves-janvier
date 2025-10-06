
export interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  categories: string[];
  tools: string[];
  date: string;
  featured: boolean;
  caseStudy?: {
    challenge: string;
    solution: string;
    results: string;
  };
  links: ProjectLink[];
}

export const projectCategories = [
  "All",
  "Web Development",
  "Data Analytics", 
  "SaaS", 
  "Fintech"
];

export const projects: Project[] = [
  {
    id: "financial-dashboard",
    title: "Financial Analytics Dashboard",
    summary: "Interactive dashboard providing real-time financial insights and data visualization for investment decision-making.",
    description: "A comprehensive financial analytics platform built for investment professionals to track markets, analyze trends, and make data-driven decisions. The dashboard features real-time data updates, interactive charts, and customizable reports.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["Data Analytics", "Fintech"],
    tools: ["React", "D3.js", "Node.js", "MongoDB", "Express"],
    date: "2023-11-15",
    featured: true,
    caseStudy: {
      challenge: "A major investment firm needed a way to consolidate multiple data sources and provide analysts with real-time insights in an intuitive interface.",
      solution: "Developed a custom dashboard that integrates market data APIs, internal databases, and predictive models into a unified interface with role-based access controls.",
      results: "Reduced analysis time by 60%, increased data accuracy by 35%, and enabled more informed investment decisions resulting in improved portfolio performance."
    },
    links: [
      { title: "Live Demo", url: "https://example.com/demo" },
      { title: "GitHub", url: "https://github.com/example" }
    ]
  },
  {
    id: "ai-recommendation-system",
    title: "AI Product Recommendation Engine",
    summary: "Machine learning-powered recommendation system that analyzes customer behavior to suggest relevant products.",
    description: "An advanced recommendation engine utilizing machine learning algorithms to analyze customer browsing behavior, purchase history, and preferences to deliver personalized product recommendations in real-time.",
    coverImage: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["Data Analytics", "SaaS"],
    tools: ["Python", "TensorFlow", "AWS", "SQL", "Flask"],
    date: "2023-08-22",
    featured: true,
    caseStudy: {
      challenge: "An e-commerce client was struggling with low conversion rates and needed a way to improve cross-selling opportunities.",
      solution: "Implemented a hybrid recommendation system combining collaborative filtering and content-based approaches, integrated with their existing e-commerce platform.",
      results: "Increased conversion rates by 24%, improved average order value by 18%, and enhanced customer satisfaction scores."
    },
    links: []
  },
  {
    id: "healthcare-management-platform",
    title: "Healthcare Management Platform",
    summary: "Comprehensive SaaS platform for healthcare providers to manage patient data, appointments, and billing.",
    description: "A HIPAA-compliant healthcare management system designed to streamline clinical workflows, secure patient data, and facilitate telemedicine services with integrated billing and reporting features.",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["SaaS", "Web Development"],
    tools: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    date: "2023-05-10",
    featured: true,
    caseStudy: {
      challenge: "Healthcare providers needed a secure, efficient way to manage patient information across multiple facilities while ensuring regulatory compliance.",
      solution: "Built a cloud-based platform with role-based access controls, audit trails, and integrated telemedicine capabilities that works across desktop and mobile devices.",
      results: "Reduced administrative workload by 40%, improved appointment attendance rates by 28%, and enabled seamless transition to hybrid care models."
    },
    links: []
  },
  {
    id: "crypto-payment-gateway",
    title: "Cryptocurrency Payment Gateway",
    summary: "Secure payment processing system that enables businesses to accept cryptocurrency transactions.",
    description: "A blockchain-based payment gateway that allows merchants to accept various cryptocurrencies while managing exchange rate risks and providing detailed transaction analytics.",
    coverImage: "https://images.unsplash.com/photo-1621501103258-d524412fd64d?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["Fintech", "Web Development"],
    tools: ["Blockchain", "React", "Node.js", "Express", "MongoDB"],
    date: "2023-01-18",
    featured: false,
    links: []
  },
  {
    id: "supply-chain-analytics",
    title: "Supply Chain Analytics Tool",
    summary: "Data-driven solution for optimizing supply chain operations and predicting potential disruptions.",
    description: "An end-to-end analytics platform for supply chain managers to visualize their entire supply network, identify bottlenecks, and use predictive analytics to mitigate risks before they impact operations.",
    coverImage: "https://images.unsplash.com/photo-1566843972476-d65b0d8f3f54?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["Data Analytics", "SaaS"],
    tools: ["Python", "R", "Tableau", "AWS", "React"],
    date: "2022-09-30",
    featured: false,
    links: []
  },
  {
    id: "smart-city-dashboard",
    title: "Smart City Monitoring Dashboard",
    summary: "IoT-powered dashboard for city administrators to monitor and manage urban infrastructure.",
    description: "A comprehensive monitoring system that integrates data from IoT sensors placed throughout urban environments to track air quality, traffic flow, energy usage, and more, helping city planners make data-informed decisions.",
    coverImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    categories: ["Data Analytics", "Web Development"],
    tools: ["IoT", "React", "Node.js", "Time Series DB", "D3.js"],
    date: "2022-06-15",
    featured: false,
    links: []
  }
];
