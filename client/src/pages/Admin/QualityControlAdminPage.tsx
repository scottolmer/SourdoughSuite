import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useNavigate } from "wouter";

export default function QualityControlAdminPage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Quality Control</h1>
          <p className="text-muted-foreground">
            Enhanced workflow for scientific research article review and publication
          </p>
        </div>
        <Button onClick={() => navigate('/admin/quality-control')}>
          <FileText className="mr-2 h-4 w-4" />
          Open Quality Control Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Articles awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Articles approved today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quality Score
            </CardTitle>
            <Badge variant="outline" className="text-xs">AI</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Average quality rating
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enhanced Review Workflow Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Individual PDF Processing
              </h4>
              <p className="text-sm text-muted-foreground">
                Upload PDFs one at a time for quality control and admin review before publication.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Gemini MoE AI Analysis
              </h4>
              <p className="text-sm text-muted-foreground">
                4 specialized bread science experts analyze content and suggest topics automatically.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approval Workflow
              </h4>
              <p className="text-sm text-muted-foreground">
                Review, edit, assign topics, and approve articles before they appear on the research page.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejection Handling
              </h4>
              <p className="text-sm text-muted-foreground">
                Corrupted or scanned PDFs are automatically rejected with clear error messages.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">SEO & Content Optimization</h4>
            <p className="text-sm text-muted-foreground">
              All summaries are automatically formatted for search engine optimization with 
              meta titles, descriptions, and keyword optimization for professional visibility.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}