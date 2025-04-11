
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2 } from "lucide-react";
import { getPatientModelResponse, storePatientData, getPatientCaseFiles } from "@/utils/aiModelUtils";
import { useToast } from "@/components/ui/use-toast";
import PatientQuestionGenerator from "./PatientQuestionGenerator";
import { savePatientConversation } from "@/integrations/supabase/client";

export interface PatientDataEvent {
  patient: {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    stage: string;
  };
  caseStudy: string;
}

export default function PatientAIAssistant() {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patientData, setPatientData] = useState<PatientDataEvent | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [caseFiles, setCaseFiles] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const handlePatientDataLoaded = async (event: CustomEvent<PatientDataEvent>) => {
      setPatientData(event.detail);
      
      if (event.detail && event.detail.patient) {
        storePatientData(event.detail.patient.id, event.detail);
        
        const initialGreeting = `I'm ready to answer questions about ${event.detail.patient.name}'s condition and care. What would you like to know?`;
        setResponse(initialGreeting);
        
        setConversationHistory([`AI: ${initialGreeting}`]);
        
        try {
          const patientCaseFiles = await getPatientCaseFiles(event.detail.patient.id);
          setCaseFiles(patientCaseFiles);
        } catch (error) {
          console.error("Error getting case files:", error);
        }
      }
    };

    // Listen for file upload events to refresh case files
    const handleFileUploaded = async (event: CustomEvent<{patientId: string}>) => {
      if (patientData?.patient && event.detail.patientId === patientData.patient.id) {
        try {
          const updatedCaseFiles = await getPatientCaseFiles(patientData.patient.id);
          setCaseFiles(updatedCaseFiles);
          
          if (updatedCaseFiles && !caseFiles) {
            toast({
              title: "Case Files Added",
              description: "New case information is now available to the assistant.",
            });
          }
        } catch (error) {
          console.error("Error refreshing case files:", error);
        }
      }
    };

    document.addEventListener('patientDataLoaded', handlePatientDataLoaded as EventListener);
    document.addEventListener('patientFileUploaded', handleFileUploaded as EventListener);
    
    return () => {
      document.removeEventListener('patientDataLoaded', handlePatientDataLoaded as EventListener);
      document.removeEventListener('patientFileUploaded', handleFileUploaded as EventListener);
    };
  }, [patientData, caseFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userQuestion = `Q: ${input}`;
    setConversationHistory(prev => [...prev, userQuestion]);
    
    setIsLoading(true);
    try {
      let prompt = input;
      let patientContext = "";
      
      if (patientData && patientData.patient) {
        patientContext = `Context: This is about patient ${patientData.patient.name} who has ${patientData.patient.diagnosis} in ${patientData.patient.stage} stage. 
        Age: ${patientData.patient.age}
        Case Study Details: ${patientData.caseStudy}
        
        ${caseFiles ? `Additional Case Files: ${caseFiles}` : ''}
        
        Previous conversation context:
        ${conversationHistory.slice(-6).join("\n")}`;
      }
      
      const aiResponse = await getPatientModelResponse(prompt, patientContext);
      setResponse(aiResponse);
      
      if (patientData?.patient?.id) {
        savePatientConversation(patientData.patient.id, `Q: ${input}\nA: ${aiResponse}`, "AI Caregiver Assistant");
      }
      
      setConversationHistory(prev => [...prev, `AI: ${aiResponse}`]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleSelectQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className={`${patientData ? "block" : "hidden"} mb-6`}>
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {patientData && (
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Patient Assistant: {patientData.patient.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask questions specific to this patient's condition and care needs
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <Textarea
                        placeholder="Ask a question about this patient..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-24 bg-white/70"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-memora-purple hover:bg-memora-purple-dark"
                        disabled={isLoading || !input.trim()}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Ask
                          </>
                        )}
                      </Button>
                    </form>

                    {caseFiles && (
                      <div className="mt-3 px-3 py-2 bg-blue-50 border-l-4 border-blue-300 rounded text-sm">
                        <p className="text-blue-800">
                          <strong>Case information available</strong> - The AI has access to this patient's case files
                        </p>
                      </div>
                    )}

                    {response && (
                      <div className="mt-4 bg-white p-4 rounded-lg border border-memora-purple/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-5 w-5 text-memora-purple" />
                          <h3 className="font-medium">AI Response</h3>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response}</p>
                      </div>
                    )}
                  </div>
                  
                  <PatientQuestionGenerator 
                    patientName={patientData.patient.name}
                    patientStage={patientData.patient.stage}
                    caseStudy={patientData.caseStudy}
                    onSelectQuestion={handleSelectQuestion}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
