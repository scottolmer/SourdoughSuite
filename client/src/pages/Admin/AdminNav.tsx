import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Settings, 
  FileText,
  CheckCircle,
  BarChart3,
  BookOpen
} from "lucide-react";

export default function AdminNav() {
  const [location] = useLocation();
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const adminSections = [
    {
      title: "Research Quality Control",
      description: "Enhanced workflow for scientific article review",
      icon: CheckCircle,
      href: "/admin/quality-control",
      color: "text-green-600",
      isNew: true
    },
    {
      title: "Simple Article Management", 
      description: "Basic article creation and management",
      icon: FileText,
      href: "/admin/simple",
      color: "text-blue-600"
    },
    {
      title: "Content Articles",
      description: "SEO-optimized educational content",
      icon: BookOpen,
      href: "/admin/content-articles",
      color: "text-orange-600"
    },
    {
      title: "Analytics & Reports",
      description: "Usage statistics and performance metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-indigo-600"
    },
    {
      title: "System Settings",
      description: "Configuration and preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600"
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your research platform with enhanced quality control workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card 
            key={section.href}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              location === section.href ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => navigate(section.href)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <section.icon className={`h-6 w-6 ${section.color}`} />
                {section.isNew && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {section.description}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(section.href);
                }}
              >
                Access {section.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Enhanced Research Platform</h3>
        <p className="text-blue-800 text-sm">
          The Quality Control Dashboard provides a comprehensive workflow for scientific research article review, 
          featuring Gemini AI analysis, topic suggestion, and publication approval processes.
        </p>
      </div>
    </div>
  );
}