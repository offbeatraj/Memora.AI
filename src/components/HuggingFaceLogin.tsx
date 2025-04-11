
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hasOpenAIAccess } from "@/utils/aiModelUtils";

interface HuggingFaceLoginProps {
  onLoginSuccess?: () => void;
}

export default function HuggingFaceLogin({ onLoginSuccess }: HuggingFaceLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error">("idle");
  const [modelAccessStatus, setModelAccessStatus] = useState<"idle" | "checking" | "granted" | "denied">("idle");
  const { toast } = useToast();
  
  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    setAuthStatus("idle");
    setModelAccessStatus("checking");

    try {
      // Check if we have OpenAI access
      const hasAccess = await hasOpenAIAccess();
      
      if (hasAccess) {
        setAuthStatus("success");
        setModelAccessStatus("granted");
        toast({
          title: "Authentication Successful",
          description: "OpenAI access is available"
        });
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setAuthStatus("error");
        setModelAccessStatus("denied");
        toast({
          title: "Authentication Error",
          description: "No API key found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus("error");
      setModelAccessStatus("denied");
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-memora-purple" />
          AI Model Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Authentication Status</p>
            <div className="flex items-center gap-2">
              {authStatus === "idle" && !isLoading && (
                <p className="text-sm text-muted-foreground">Checking authentication...</p>
              )}
              {isLoading && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <p className="text-sm text-amber-500">Checking access...</p>
                </>
              )}
              {authStatus === "success" && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">Authentication successful</p>
                </>
              )}
              {authStatus === "error" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <p className="text-sm text-amber-500">Retrying authentication...</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Model Access Status</p>
            <div className="flex items-center gap-2">
              {modelAccessStatus === "idle" && (
                <p className="text-sm text-muted-foreground">Not checked</p>
              )}
              {modelAccessStatus === "checking" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <p className="text-sm text-amber-500">Checking OpenAI access...</p>
                </>
              )}
              {modelAccessStatus === "granted" && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">Access to OpenAI granted</p>
                </>
              )}
              {modelAccessStatus === "denied" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <p className="text-sm text-amber-500">
                    Attempting to reconnect...
                  </p>
                </>
              )}
            </div>
          </div>

          {authStatus === "success" && modelAccessStatus === "granted" && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                You're all set! OpenAI model is ready to use.
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={checkAuthStatus} 
              disabled={isLoading || (authStatus === "success" && modelAccessStatus === "granted")}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Terminal className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Checking..." : (authStatus === "success" && modelAccessStatus === "granted") ? "Connected" : "Retry Authentication"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
