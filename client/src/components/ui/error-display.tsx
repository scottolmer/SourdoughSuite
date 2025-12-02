import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  description?: string;
  error?: Error | string;
  showDetails?: boolean;
  retry?: () => void;
  children?: React.ReactNode;
}

export const ErrorDisplay = ({
  title = 'An error occurred',
  description = 'We encountered a problem loading this content.',
  error,
  showDetails = false,
  retry,
  children
}: ErrorDisplayProps) => {
  // Format error message
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription className="text-red-500/90 dark:text-red-300/90">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showDetails && errorMessage && (
          <div className="bg-white/80 dark:bg-red-950/50 rounded-md p-3 text-sm font-mono text-red-800 dark:text-red-200 overflow-auto mb-4">
            {errorMessage}
          </div>
        )}
        {children}
      </CardContent>
      {retry && (
        <CardFooter>
          <Button onClick={retry} variant="outline" className="border-red-300 hover:bg-red-100 dark:hover:bg-red-800">
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorDisplay;