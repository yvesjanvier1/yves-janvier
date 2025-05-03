
import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Example dashboard data
const visitors = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 700 },
  { name: "Jun", value: 900 },
  { name: "Jul", value: 1100 },
];

const portfolioViews = [
  { name: "Financial Dashboard", value: 240 },
  { name: "AI Recommendation", value: 180 },
  { name: "Healthcare Platform", value: 200 },
  { name: "Crypto Gateway", value: 120 },
  { name: "Supply Chain", value: 90 },
  { name: "Smart City", value: 170 },
];

const blogData = [
  { name: "Data Visualization", value: 350 },
  { name: "Scalable SaaS", value: 280 },
  { name: "Machine Learning", value: 300 },
  { name: "Fintech Trends", value: 200 },
  { name: "Ethical AI", value: 230 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes only - in a real app, implement proper authentication
    if (loginData.email === "admin@example.com" && loginData.password === "password") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials. For demo, use admin@example.com / password");
    }
  };
  
  // If not logged in, show login screen
  if (!isLoggedIn) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Login</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">For demo: admin@example.com</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">For demo: password</p>
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }
  
  // Dashboard content (when logged in)
  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
          Sign Out
        </Button>
      </div>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-1">Total Visitors</h3>
          <p className="text-3xl font-bold">4,800</p>
          <p className="text-sm text-green-500 mt-2">↑ 12% from last month</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-1">Portfolio Views</h3>
          <p className="text-3xl font-bold">1,000</p>
          <p className="text-sm text-green-500 mt-2">↑ 8% from last month</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-1">Blog Engagement</h3>
          <p className="text-3xl font-bold">1,360</p>
          <p className="text-sm text-green-500 mt-2">↑ 15% from last month</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="space-y-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-6">Website Visitors (Monthly)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitors} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-6">Portfolio Project Views</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))">
                    {portfolioViews.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-6">Blog Post Traffic</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={blogData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {blogData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
