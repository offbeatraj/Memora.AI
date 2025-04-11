
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-memora-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-memora-purple" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">Page Not Found</h1>
          <p className="text-lg text-foreground/70 mb-8">
            We couldn't find the page you were looking for. It might have been moved or deleted.
          </p>
          <Button className="bg-memora-purple hover:bg-memora-purple-dark" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </a>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
