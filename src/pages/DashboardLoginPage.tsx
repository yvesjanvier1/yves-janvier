
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/dashboard/AuthProvider";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const DashboardLoginPage = () => {
  const { signIn, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error?.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Login</h1>
        <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
      </div>
      
      <div className="bg-card border rounded-lg shadow-sm p-8">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>For dashboard access, please use your administrator credentials.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardLoginPage;
