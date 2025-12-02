import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Redirect component that sends users to the enhanced tools menu recipe generator
 * This consolidates all recipe generation functionality into one location
 */
export function RecipeGeneratorRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to the enhanced tools menu recipe generator
    navigate("/tools/recipe-generator");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Recipe Generator...</p>
      </div>
    </div>
  );
}