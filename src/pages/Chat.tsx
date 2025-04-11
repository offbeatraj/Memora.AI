import Layout from "@/components/Layout";
import ChatInterface from "@/components/ChatInterface";
import PatientAIAssistant from "@/components/PatientAIAssistant";
import PatientSelector from "@/components/PatientSelector";
import { Brain, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import HuggingFaceLogin from "@/components/HuggingFaceLogin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getOpenAIKey, setOpenAIKey, hasOpenAIAccess } from "@/utils/aiModelUtils";
import { useToast } from "@/components/ui/use-toast";

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  stage: string;
  gender: string;
}

export default function Chat() {
  const [showCLILogin, setShowCLILogin] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [openApiKeyDialogOpen, setOpenApiKeyDialogOpen] = useState(false);
  const [hasOpenAI, setHasOpenAI] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkOpenAIAccess = async () => {
      try {
        const key = await getOpenAIKey();
        setApiKey(key);
        setHasOpenAI(!!key);
      } catch (error) {
        console.error("Error checking OpenAI access:", error);
      }
    };
    
    checkOpenAIAccess();
  }, []);

  const handleLoginSuccess = () => {
    setShowCLILogin(false);
  };

  const handleSaveApiKey = async () => {
    if (apiKey) {
      await setOpenAIKey(apiKey);
      setHasOpenAI(true);
      setOpenApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully.",
      });
    }
  };

  const handleClearApiKey = async () => {
    setApiKey("");
    await setOpenAIKey("");
    setHasOpenAI(false);
    toast({
      title: "API Key Cleared",
      description: "Your OpenAI API key has been removed.",
    });
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    
    const patientDataEvent = new CustomEvent('patientDataLoaded', {
      detail: {
        patient: {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          diagnosis: patient.diagnosis,
          stage: patient.stage
        },
        caseStudy: `Patient ${patient.name} is ${patient.age} years old with ${patient.diagnosis} in the ${patient.stage} stage.`
      }
    });
    
    document.dispatchEvent(patientDataEvent);
    
    toast({
      title: "Patient Selected",
      description: `You've selected ${patient.name} for this chat session.`,
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-memora-purple" />
              <h1 className="text-2xl font-bold">Memory Assistant Chat</h1>
            </div>
            <PatientSelector onSelectPatient={handlePatientSelect} />
          </div>
          <p className="text-muted-foreground">
            Ask questions about Alzheimer's or request personalized help. Your AI companion can provide information, emotional support, and memory assistance.
          </p>
        </div>
        
        {!hasOpenAI && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <Brain className="h-4 w-4" />
            <AlertTitle>Using Simulated Responses</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>For full AI functionality, you can add your OpenAI API key to use the GPT model.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white w-fit"
                onClick={() => setOpenApiKeyDialogOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Add OpenAI API Key
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <PatientAIAssistant />
        
        {showCLILogin && (
          <div className="mb-6">
            <HuggingFaceLogin onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
        
        <Card className="glass-card">
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="assistant" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="assistant">
                  Personal Assistant
                </TabsTrigger>
                <TabsTrigger value="info">
                  Information Mode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistant" className="mt-0">
                <ChatInterface />
              </TabsContent>
              
              <TabsContent value="info" className="mt-0">
                <div className="text-center py-8 px-4">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-memora-purple/70" />
                  <h2 className="text-xl font-bold mb-2">Information Mode</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    This mode provides factual information about Alzheimer's disease, treatments, and care strategies without personalization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">About Alzheimer's Disease</h3>
                      <p className="text-sm text-muted-foreground">
                        Alzheimer's is a progressive brain disorder that slowly destroys memory and thinking skills. It's the most common cause of dementia in older adults.
                      </p>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Warning Signs</h3>
                      <p className="text-sm text-muted-foreground">
                        Memory loss disrupting daily life, challenges in planning or problem-solving, difficulty completing familiar tasks, and confusion with time or place.
                      </p>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Current Treatments</h3>
                      <p className="text-sm text-muted-foreground">
                        While there's no cure, medications can help manage symptoms. Non-drug approaches include cognitive stimulation and lifestyle modifications.
                      </p>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Caregiving Tips</h3>
                      <p className="text-sm text-muted-foreground">
                        Establish routines, simplify communication, create a safe environment, and focus on remaining abilities rather than lost ones.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openApiKeyDialogOpen} onOpenChange={setOpenApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OpenAI API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="api-key">Enter your OpenAI API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored securely in our database and never exposed to other users.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} className="flex-1">
                Save Key
              </Button>
              <Button onClick={handleClearApiKey} variant="outline" className="flex-1">
                Clear Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
