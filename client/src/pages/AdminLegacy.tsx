import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import RecipeImport from './Admin/RecipeImport';
import ProductManagement from './Admin/ProductManagement';
import FAQManagement from './Admin/FAQManagement';
import StarterManagement from './Admin/StarterManagement';
import AISettings from './Admin/AISettings';
import ContentArticlesAdminPage from './admin/ContentArticlesAdminPage';
import AdminPasscode from '@/components/AdminPasscode';

export default function AdminLegacy() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("recipe-import");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Set the active tab based on the current URL
  useEffect(() => {
    if (location === "/admin/faqs") {
      setActiveTab("faq-management");
    } else if (location === "/admin/content-articles") {
      setActiveTab("content-management");
    }
  }, [location]);

  // Handle successful passcode entry
  const handlePasscodeSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show passcode screen if not authenticated
  if (!isAuthenticated) {
    return <AdminPasscode onSuccess={handlePasscodeSuccess} />;
  }
  
  return (
    <div className="py-10 px-4 md:px-6 mx-auto admin-content overflow-hidden" style={{ maxWidth: '95%' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-medium">Legacy Admin Dashboard</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" style={{ maxWidth: '100%' }}>
        <div className="w-full pb-2 px-0">
          <TabsList className="mb-6 bg-amber-50 flex flex-wrap gap-1 w-full" style={{ maxWidth: '90vw' }}>
            <TabsTrigger value="recipe-import" className="px-2 py-1 text-xs">Recipe</TabsTrigger>
            <TabsTrigger value="product-management" className="px-2 py-1 text-xs">Products</TabsTrigger>
            <TabsTrigger value="starter-management" className="px-2 py-1 text-xs">Starters</TabsTrigger>
            <TabsTrigger value="faq-management" className="px-2 py-1 text-xs">FAQs</TabsTrigger>
            <TabsTrigger value="content-management" className="px-2 py-1 text-xs">Articles</TabsTrigger>
            <TabsTrigger value="ai-settings" className="px-2 py-1 text-xs">AI</TabsTrigger>
          </TabsList>
        </div>
        <div className="overflow-x-hidden w-full">
          <TabsContent value="recipe-import" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <RecipeImport />
            </div>
          </TabsContent>
          <TabsContent value="product-management" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <ProductManagement />
            </div>
          </TabsContent>
          <TabsContent value="starter-management" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <StarterManagement />
            </div>
          </TabsContent>
          <TabsContent value="faq-management" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <FAQManagement />
            </div>
          </TabsContent>
          <TabsContent value="content-management" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <ContentArticlesAdminPage />
            </div>
          </TabsContent>
          <TabsContent value="ai-settings" className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="w-full max-w-full overflow-x-hidden">
              <AISettings />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}