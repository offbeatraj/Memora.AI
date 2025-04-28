
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2 } from "lucide-react";
import { getPatientModelResponse, storePatientData, getPatientCaseFiles } from "@/utils/aiModelUtils";
import { useToast } from "@/components/ui/use-toast";
import PatientQuestionGenerator from "./PatientQuestionGenerator";
import { savePatientConversation } from "@/integrations/supabase/client";
import React from 'react'; // Import React

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

// --- Helper function to parse and format the AI response (No changes needed here) ---
const formatAIResponse = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Handle bold text: **text**
    const renderLineWithBold = (lineContent: string) => {
      const parts = lineContent.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    // Handle numbered lists: 1. text
    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inList) {
        inList = true;
        listItems = []; // Start a new list
      }
      const itemContent = trimmedLine.replace(/^\d+\.\s/, '');
      listItems.push(
        <li key={`li-${index}`} className="ml-4 mb-1">
          {renderLineWithBold(itemContent)}
        </li>
      );
    } else {
      // If we were in a list, close it
      if (inList) {
        elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside my-2 space-y-1">{listItems}</ol>);
        listItems = [];
        inList = false;
      }

      // Handle empty lines as paragraph breaks
      if (trimmedLine === "") {
        elements.push(<div key={`br-${index}`} className="h-2"></div>); // Add some space
      } else {
         // Render regular lines (checking for bold)
         elements.push(
           <p key={`p-${index}`} className="mb-2">
             {renderLineWithBold(trimmedLine)}
           </p>
         );
      }
    }
  });

  // Add any remaining list items if the text ends with a list
  if (inList) {
    elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside my-2 space-y-1">{listItems}</ol>);
  }

  return elements;
};
// --- End Helper function ---


export default function PatientAIAssistant() {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>(""); // Initialize response as empty
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

        // --- Remove hardcoded initial greeting ---
        // Set a simple ready message or leave blank
        const initialGreeting = `Ready to assist with ${event.detail.patient.name}. Ask a question below.`;
        setResponse(initialGreeting); // Set the simple greeting
        setConversationHistory([`System: Patient context loaded for ${event.detail.patient.name}.`]); // Log system event instead of AI message
        // --- End Remove hardcoded initial greeting ---

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
  }, [patientData, caseFiles, toast]); // Added toast dependency back

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = `Q: ${input}`;
    setConversationHistory(prev => [...prev, userQuestion]);
    setResponse(""); // Clear previous response while loading new one
    setIsLoading(true);
    try {
      let prompt = input;
      let patientContext = "";

      if (patientData && patientData.patient) {
        // --- Add instruction to AI about formatting ---
        patientContext = `Context: This is about patient ${patientData.patient.name} who has ${patientData.patient.diagnosis} in ${patientData.patient.stage} stage.
        Age: ${patientData.patient.age}
        Case Study Details: ${patientData.caseStudy}

        ${caseFiles ? `Additional Case Files: ${caseFiles}` : ''}

        Previous conversation context:
        ${conversationHistory.slice(-6).join("\n")}

        ---
        IMPORTANT INSTRUCTION: Format your response using standard markdown. Use **bold text** for emphasis and numbered lists (e.g., "1. First item") where appropriate. Do NOT use asterisks (*) for lists or emphasis.
        ---`;
        // --- End instruction ---
      }

      const aiResponse = await getPatientModelResponse(prompt, patientContext);
      setResponse(aiResponse); // Set the new response

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
      setResponse("Sorry, I couldn't get a response. Please try again."); // Show error in response area
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleSelectQuestion = (question: string) => {
    setInput(question);
  };

  // --- Update Rendering Logic ---
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap */}
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


                    {/* Updated AI Response Section */}
                    {(isLoading || response) && ( // Show this section if loading OR if there is a response
                       <div className="mt-4 bg-white p-4 rounded-lg border border-memora-purple/20 shadow-sm"> {/* Added shadow */}
                        <div className="flex items-center gap-2 mb-3"> {/* Increased margin-bottom */}
                          <Bot className="h-5 w-5 text-memora-purple" />
                          <h3 className="font-medium text-base">AI Response</h3> {/* Slightly larger heading */}
                        </div>
                        {isLoading ? ( // Show loader *only* when actively loading
                           <div className="flex items-center justify-center py-4">
                             <Loader2 className="h-6 w-6 animate-spin text-memora-purple" />
                             <span className="ml-2 text-sm text-muted-foreground">Generating response...</span>
                           </div>
                         ) : ( // Otherwise, show the formatted response
                           <div className="text-sm space-y-2 prose prose-sm max-w-none"> {/* Added prose for better typography */}
                             {formatAIResponse(response)}
                           </div>
                         )}
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
  // --- End Update Rendering Logic ---
}
