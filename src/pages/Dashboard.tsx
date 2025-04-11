
import Layout from "@/components/Layout";
import PatientProfile from "@/components/PatientProfile";
import PatientSelector from "@/components/PatientSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Brain, MessageSquare, Activity, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PatientAIAssistant from "@/components/PatientAIAssistant";
import PatientWellbeingQuestionnaire from "@/components/PatientWellbeingQuestionnaire";
import { useToast } from "@/components/ui/use-toast";
import { getPatientConversations, formatConversationTimestamp } from "@/utils/aiModelUtils";

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  stage: string;
  gender: string;
}

interface PatientTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: "high" | "medium" | "low";
}

interface PatientFile {
  id: string;
  file_name: string;
  upload_date: string;
  file_category: string;
}

interface PatientConversation {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patientTasks, setPatientTasks] = useState<PatientTask[]>([]);
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([]);
  const [patientConversations, setPatientConversations] = useState<PatientConversation[]>([]);
  const [wellbeingScores, setWellbeingScores] = useState({
    sleep: 0,
    activity: 0,
    mood: 0,
    overall: 0
  });
  const { toast } = useToast();

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientData(patient.id);
  };

  // Fetch patient-specific data
  const fetchPatientData = async (patientId: string) => {
    setIsLoading(true);
    try {
      // Fetch patient tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('patient_tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (tasksError) throw tasksError;
      
      // Format and prioritize tasks
      const formattedTasks = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        due_date: new Date(task.due_date).toLocaleDateString(),
        status: task.status,
        priority: determinePriority(task.due_date, task.status)
      }));
      
      setPatientTasks(formattedTasks);
      
      // Fetch patient files
      const { data: filesData, error: filesError } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', patientId)
        .order('upload_date', { ascending: false })
        .limit(10);
      
      if (filesError) throw filesError;
      
      const formattedFiles = filesData.map(file => ({
        id: file.id,
        file_name: file.file_name,
        upload_date: new Date(file.upload_date).toLocaleDateString(),
        file_category: file.file_category
      }));
      
      setPatientFiles(formattedFiles);
      
      // Fetch actual patient conversations from storage
      fetchPatientConversations(patientId);
      
      // Generate wellbeing scores (would be from actual questionnaire results in production)
      generateWellbeingScores();
      
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error fetching patient data",
        description: "Could not load patient information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to determine task priority
  const determinePriority = (dueDate: string, status: string): "high" | "medium" | "low" => {
    if (status === "overdue") return "high";
    
    const today = new Date();
    const taskDate = new Date(dueDate);
    const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "high";
    if (diffDays <= 3) return "medium";
    return "low";
  };
  
  // Fetch patient conversations from storage
  const fetchPatientConversations = (patientId: string) => {
    // Get stored conversations for this patient
    const storedConversations = getPatientConversations(patientId);
    
    if (storedConversations && storedConversations.length > 0) {
      // Format the conversations for display
      const formattedConversations = storedConversations.map(conv => ({
        id: conv.id || crypto.randomUUID(),
        title: conv.title || "AI Assistant",
        message: conv.message || conv.content || "",
        timestamp: formatConversationTimestamp(conv.timestamp)
      }));
      
      setPatientConversations(formattedConversations);
    } else {
      // If no stored conversations, create fallback conversations
      createFallbackConversations(patientId);
    }
  };
  
  // Create fallback conversations if none exist
  const createFallbackConversations = (patientId: string) => {
    // In production, these would come from a database or chat history
    const mockConversations = [
      {
        id: "1",
        title: "Memory Support",
        message: selectedPatient ? `Remember to take your medication at 7:00 PM with dinner, ${selectedPatient.name}. I'll send you a reminder when it's time.` : "",
        timestamp: "Today at 2:34 PM"
      },
      {
        id: "2",
        title: "Family Visit",
        message: "Your daughter Sarah is coming to visit this weekend. She mentioned bringing photos from your trip to the lake last summer.",
        timestamp: "Yesterday at 6:15 PM"
      },
      {
        id: "3",
        title: "Today's Weather",
        message: "It's sunny and 72°F outside today. A perfect day for a short walk in the garden.",
        timestamp: "Today at 9:12 AM"
      },
      {
        id: "4",
        title: "Memory Exercise",
        message: selectedPatient ? `We completed a memory game this morning. You correctly identified 8 out of 10 items - that's great progress, ${selectedPatient.name}!` : "",
        timestamp: "Today at 11:45 AM"
      }
    ];
    
    setPatientConversations(mockConversations);
  };
  
  // Generate wellbeing scores - in production, these would come from questionnaire results
  const generateWellbeingScores = () => {
    // In a real app, these would be calculated from patient questionnaire responses
    const sleep = Math.floor(Math.random() * 30) + 70; // 70-100%
    const activity = Math.floor(Math.random() * 40) + 60; // 60-100%
    const mood = Math.floor(Math.random() * 35) + 65; // 65-100%
    const overall = Math.floor((sleep + activity + mood) / 3);
    
    setWellbeingScores({
      sleep,
      activity,
      mood,
      overall
    });
  };
  
  // Handle questionnaire submission
  const handleQuestionnaireSubmit = (scores: {sleep: number, activity: number, mood: number, overall: number}) => {
    setWellbeingScores(scores);
    
    toast({
      title: "Wellbeing assessment updated",
      description: "The patient's wellbeing summary has been updated based on the questionnaire.",
    });
  };

  // Listen for new conversations from PatientAIAssistant
  useEffect(() => {
    const handleNewConversation = (event: CustomEvent) => {
      if (selectedPatient && event.detail.patientId === selectedPatient.id) {
        // Refresh conversations when a new one is added
        fetchPatientConversations(selectedPatient.id);
      }
    };

    // Add event listener
    document.addEventListener('newPatientConversation', handleNewConversation as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('newPatientConversation', handleNewConversation as EventListener);
    };
  }, [selectedPatient]);

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Memory Support Dashboard</h1>
            <p className="text-muted-foreground">
              Track cognitive health, daily activities, and access support resources.
            </p>
          </div>
          <PatientSelector onSelectPatient={handlePatientSelect} />
        </div>
      </div>
      
      {!selectedPatient ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Brain className="h-16 w-16 text-memora-purple/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Select a Patient</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please select a patient from the dropdown above to view their dashboard information and wellbeing status.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-16 w-16 text-memora-purple animate-spin mb-4" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      ) : (
        <>
          <PatientAIAssistant />
        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="font-medium">Today's Tasks</p>
                      </div>
                      <p className="text-2xl font-bold">{patientTasks.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="font-medium">Documents</p>
                      </div>
                      <p className="text-2xl font-bold">{patientFiles.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="font-medium">Well-being</p>
                      </div>
                      <p className="text-2xl font-bold">{wellbeingScores.overall}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Recent Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="important">
                    <TabsList className="mb-4 bg-background/50">
                      <TabsTrigger value="important" className="data-[state=active]:bg-memora-purple data-[state=active]:text-white">
                        Important
                      </TabsTrigger>
                      <TabsTrigger value="recent" className="data-[state=active]:bg-memora-purple data-[state=active]:text-white">
                        Recent
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="important">
                      <div className="space-y-3">
                        {patientConversations.slice(0, 2).map((conv) => (
                          <div key={conv.id} className="bg-white/70 p-3 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="bg-memora-purple/20 p-2 rounded-full shrink-0">
                                <Brain className="h-4 w-4 text-memora-purple" />
                              </div>
                              <div>
                                <p className="font-medium mb-1">{conv.title}</p>
                                <p className="text-sm">{conv.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {patientConversations.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No conversations with this patient yet.</p>
                            <p className="text-sm mt-1">Try using the AI Assistant above to start a conversation.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="recent">
                      <div className="space-y-3">
                        {patientConversations.slice(0, 4).map((conv) => (
                          <div key={conv.id} className="bg-white/70 p-3 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="bg-memora-purple/20 p-2 rounded-full shrink-0">
                                <Brain className="h-4 w-4 text-memora-purple" />
                              </div>
                              <div>
                                <p className="font-medium mb-1">{conv.title}</p>
                                <p className="text-sm">{conv.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {patientConversations.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No conversations with this patient yet.</p>
                            <p className="text-sm mt-1">Try using the AI Assistant above to start a conversation.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <PatientWellbeingQuestionnaire onSubmit={handleQuestionnaireSubmit} />
            </div>
            
            <div className="space-y-6">
              <PatientProfile 
                patientId={selectedPatient.id} 
                wellbeingScores={wellbeingScores}
              />
              
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold">Support Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-memora-purple" />
                        <h3 className="font-medium">Alzheimer's Association</h3>
                      </div>
                      <p className="text-sm mt-1">24/7 Helpline: 800-272-3900</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-memora-purple" />
                        <h3 className="font-medium">Caregiver Support Group</h3>
                      </div>
                      <p className="text-sm mt-1">Next meeting: April 15, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
