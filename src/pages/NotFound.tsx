
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center max-w-md p-8 rounded-lg bg-white shadow-sm border border-gray-100">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl font-bold text-red-400">4</span>
          <span className="text-6xl font-bold text-yorpro-600">0</span>
          <span className="text-6xl font-bold text-red-400">4</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="flex justify-center">
          <Button asChild variant="default" className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
