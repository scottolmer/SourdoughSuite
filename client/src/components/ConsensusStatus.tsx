import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Brain, Shield, Users } from "lucide-react";

interface ConsensusStatus {
  isEnabled: boolean;
  hasUnifiedApiKey: boolean;
  providers: string[];
  fallbackService: string;
}

export function ConsensusStatus() {
  const { data: status, isLoading } = useQuery<ConsensusStatus>({
    queryKey: ['/api/ai/consensus/status'],
    refetchInterval: 30000 // Check every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4" />
            AI System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" />
          AI System Status
        </CardTitle>
        <CardDescription className="text-xs">
          Multi-LLM consensus reduces hallucinations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Consensus System</span>
          <Badge 
            variant={status.isEnabled ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {status.isEnabled ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {status.isEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>

        {status.isEnabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Active Providers ({status.providers.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {status.providers.map((provider) => (
                <Badge key={provider} variant="outline" className="text-xs">
                  {provider}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Fallback: {status.fallbackService}</span>
        </div>

        {status.isEnabled && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
            ✓ Enhanced recipe accuracy with multiple AI validation
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConsensusStatus;