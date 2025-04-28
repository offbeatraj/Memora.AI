import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Loader2, User, Bot, ChevronDown, Star, Image, Paperclip, MessageCircleQuestion, Activity, X, Clipboard, FileText } from "lucide-react"; // Add Clipboard and FileText
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getModelResponse } from "@/utils/aiModelUtils";
import { PatientDataEvent } from "@/components/PatientAIAssistant";
import QuestionGenerator from "@/components/QuestionGenerator";
import React from 'react'; // Ensure React is imported

// Helper function to format message content
const formatMessageContent = (text: string): React.ReactNode => {
  // Regex to find URLs (simplified version)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Regex for bold text
  const boldRegex = /(\*\*.*?\*\*)/g;
  // Regex for list items
  const listRegex = /^\* /;

  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    let currentLineContent: React.ReactNode[] = [];

    // Check for list items first
    if (listRegex.test(line.trim())) {
      const listItemText = line.trim().substring(2);
      // Process this list item text for URLs and bold
      const segments = listItemText.split(urlRegex); // Split by URLs

      segments.forEach((segment, segmentIndex) => {
        if (segment?.match(urlRegex)) { // It's a URL
          currentLineContent.push(
            <a key={`${lineIndex}-url-${segmentIndex}`} href={segment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {segment}
            </a>
          );
        } else if (segment) { // It's regular text, check for bold
          const boldParts = segment.split(boldRegex);
          boldParts.forEach((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              currentLineContent.push(<strong key={`${lineIndex}-bold-${segmentIndex}-${partIndex}`} className="font-semibold">{part.slice(2, -2)}</strong>);
            } else if (part) {
              currentLineContent.push(<span key={`${lineIndex}-text-${segmentIndex}-${partIndex}`}>{part}</span>);
            }
          });
        }
      });

      return (
        <div key={lineIndex} className="flex items-start">
          <span className="mr-2 mt-1">•</span>
          <div>{currentLineContent}</div>
          {lineIndex < lines.length - 1 && <br />}
        </div>
      );

    } else { // Process regular lines for URLs and bold
      const segments = line.split(urlRegex); // Split by URLs
      segments.forEach((segment, segmentIndex) => {
        if (segment?.match(urlRegex)) { // It's a URL
          currentLineContent.push(
            <a key={`${lineIndex}-url-${segmentIndex}`} href={segment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {segment}
            </a>
          );
        } else if (segment) { // It's regular text, check for bold
          const boldParts = segment.split(boldRegex);
          boldParts.forEach((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              currentLineContent.push(<strong key={`${lineIndex}-bold-${segmentIndex}-${partIndex}`} className="font-semibold">{part.slice(2, -2)}</strong>);
            } else if (part) {
              currentLineContent.push(<span key={`${lineIndex}-text-${segmentIndex}-${partIndex}`}>{part}</span>);
            }
          });
        }
      });

       return (
         <div key={lineIndex}>
           {currentLineContent}
           {lineIndex < lines.length - 1 && <br />}
         </div>
       );
    }
  }).filter(Boolean); // Filter out any potential null/empty results
};
type MessageType = "text" | "image" | "reminder" | "health" | "question" | "case_study";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  important?: boolean;
  type?: MessageType;
  metadata?: Record<string, any>;
};

interface PatientContext {
  patient: {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    stage: "early" | "moderate" | "advanced";
    caseStudy?: string; // Original case study from patient data
  } | null;
  caseStudy: string; // Original case study from patient data (duplicate?) - Let's keep for now
  uploadedCaseStudy?: string; // Add field for user-uploaded case study
}

const validateStage = (stage: string): "early" | "moderate" | "advanced" => {
  if (stage === "early" || stage === "moderate" || stage === "advanced") {
    return stage;
  }
  console.warn(`Invalid stage value: ${stage}. Defaulting to "moderate".`);
  return "moderate";
};

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm Memora, your personal memory assistant powered by Gemini 2.0 Flash. How can I help you today? I can answer questions about Alzheimer's, provide daily support, or just chat.",
    role: "assistant",
    timestamp: new Date(),
    type: "text"
  },
];

const sampleQuestions = [
  "What are the early symptoms of Alzheimer's?",
  "Help me remember to take my medicine",
  "What activities can improve brain health?",
  "Tell me about my family photos",
  "What day is it today?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "insights" | "questions">("chat");
  // --- Update attachmentType state ---
  const [attachmentType, setAttachmentType] = useState<"none" | "image" | "health" | "question" | "case_study">("none");
  // --- End Update attachmentType state ---
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [generatedPatientQuestions, setGeneratedPatientQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null); // Add ref for textarea

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handlePatientDataLoaded = (event: CustomEvent<PatientDataEvent>) => {
      const { patient, caseStudy } = event.detail;
      
      setPatientContext({
        patient: {
          ...patient,
          stage: validateStage(patient.stage)
        },
        caseStudy
      });
      
      generatePatientSpecificQuestions(patient, caseStudy);
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: `${patient.name}'s data has been loaded. You can now ask questions specific to this patient.`,
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, systemMessage]);
      setActiveTab("questions");
    };

    document.addEventListener('patientDataLoaded', handlePatientDataLoaded as EventListener);
    
    return () => {
      document.removeEventListener('patientDataLoaded', handlePatientDataLoaded as EventListener);
    };
  }, []);

  const generatePatientSpecificQuestions = (patient: any, caseStudy: string) => {
    const baseQuestions = [
      `What medications is ${patient.name} currently taking?`,
      `What are the best activities for ${patient.name} at their current stage?`,
      `What diet is recommended for ${patient.name}?`,
      `What are the main symptoms that ${patient.name} is experiencing?`,
      `What memory exercises would help ${patient.name} the most?`,
    ];

    if (patient.stage === "early") {
      baseQuestions.push(`What strategies can help ${patient.name} maintain independence?`);
      baseQuestions.push(`What early interventions are recommended for ${patient.name}?`);
    } else if (patient.stage === "moderate") {
      baseQuestions.push(`What safety measures should be implemented for ${patient.name}?`);
      baseQuestions.push(`How can we manage ${patient.name}'s daily routine effectively?`);
    } else if (patient.stage === "advanced") {
      baseQuestions.push(`What comfort measures are most important for ${patient.name}?`);
      baseQuestions.push(`What are the best communication strategies with ${patient.name}?`);
    }

    setGeneratedPatientQuestions(baseQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && attachmentType === "none") return;

    let content = input.trim();
    let type: MessageType = "text";
    let metadata = {};

    // --- Modify Case Study Handling ---
    if (attachmentType === "case_study") {
      type = "case_study";
      content = input; // The input itself is the case study text
      metadata = { title: "Case Study Provided" };

      // Store the uploaded case study in the context state
      setPatientContext(prev => ({
        // Ensure patient and original caseStudy fields are preserved or initialized
        patient: prev?.patient || null,
        caseStudy: prev?.caseStudy || "",
        // Add the uploaded case study content
        uploadedCaseStudy: content
      }));

      // Create the user message *before* calling the AI for analysis
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
        type,
        metadata
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setAttachmentType("none"); // Reset attachment type

      // Now, call the AI specifically to analyze *this* case study submission
      setIsLoading(true);
      try {
        const analysisPrompt = `The user has provided the following case study text. Please analyze it, summarize the key points, and confirm you will use this context for future questions:\n\n"${content}"\n\nConsider the context of Alzheimer's care if applicable.`;
        const response = await getModelResponse(analysisPrompt);
        const assistantAnalysisMessage: Message = {
          id: Date.now().toString() + '-analysis',
          content: response,
          role: "assistant",
          timestamp: new Date(),
          type: "text", // Keep analysis as text
          metadata: { analysisSummary: "AI analysis of uploaded case study." }
        };
        setMessages((prev) => [...prev, assistantAnalysisMessage]);
      } catch (error) {
        console.error("Error getting AI analysis response:", error);
        const errorMessage: Message = {
          id: Date.now().toString() + '-error',
          content: "I'm sorry, I encountered an issue analyzing the case study. However, I have stored it for context.",
          role: "assistant",
          timestamp: new Date(),
          type: "text"
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return; // Stop processing here for case study submission

    } else if (attachmentType === "image") {
      type = "image";
      // Keep placeholder logic for image path
      content = input ? `Shared an image with caption: ${input}` : "Shared an image";
      metadata = { imagePath: "/placeholder.svg", caption: input || "Family photo" };
    } else if (attachmentType === "health") {
      type = "health";
      content = input ? `Shared health data with note: ${input}` : "Shared health data";
      metadata = {
        bloodPressure: "120/80", // Example data
        temperature: "98.6°F",
        heartRate: "72 bpm",
        oxygen: "98%",
        note: input || "Daily health check"
      };
    } else if (attachmentType === "question") {
      type = "question";
      content = input || "Generated question about memory";
    }
    // --- End Modify Case Study Handling ---


    // Create user message for non-case-study submissions
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      type, // Use the determined type
      metadata // Use the determined metadata
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachmentType("none"); // Reset attachment type

    // --- Add check for "What day is it today?" ---
    const lowerCaseContent = content.toLowerCase().trim();
    if (lowerCaseContent === "what day is it today?" || lowerCaseContent === "what's the date today?" || lowerCaseContent === "what is the date today?") {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const dateMessage: Message = {
        id: Date.now().toString() + '-localdate', // Ensure unique ID
        content: `Today is ${formattedDate}.`,
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      setMessages((prev) => [...prev, dateMessage]);
      return; // Stop processing, don't call the AI
    }


    setIsLoading(true);

    try {
      let prompt = content; // Default prompt is just the user's content
      let contextPrompt = "";

      const recentMessages = messages
        .slice(-8) // Maybe include slightly more history now
        .filter(msg => msg.type !== 'case_study') // Exclude the raw case study submission message from history
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");

      // --- Modify Context Prompt Generation ---
      const uploadedCaseStudyText = patientContext?.uploadedCaseStudy; // Get uploaded text

      if (patientContext) {
        const { patient, caseStudy } = patientContext; // Original patient data
        contextPrompt = `Context:
        ${patient ? `This is about patient ${patient.name} who has ${patient.diagnosis} in ${patient.stage} stage. Age: ${patient.age}.` : 'General context.'}
        ${caseStudy ? `\nOriginal Patient Case Study: ${caseStudy}` : ''}
        ${uploadedCaseStudyText ? `\n\n*** User Uploaded Case Scenario ***\n${uploadedCaseStudyText}\n*** End Case Scenario ***` : ''}

        Recent conversation:
        ${recentMessages}

        User Question: ${content}`;
      } else {
         // Even without full patient context, use uploaded case study if available
         contextPrompt = `${uploadedCaseStudyText ? `*** User Uploaded Case Scenario ***\n${uploadedCaseStudyText}\n*** End Case Scenario ***\n\n` : ''}
         Recent conversation:
         ${recentMessages}

         User Question: ${content}`;
      }

      // Use the constructed context prompt for text messages
      if (type === "text" || type === "question") {
         prompt = contextPrompt;
      } else if (type === "image") {
         prompt = `Considering the following context:\n${contextPrompt}\n\nThe user also shared an image ${metadata.caption ? `with the caption "${metadata.caption}"` : ''}. Please provide a response about this image, how it might help with memory, and suggestions for using photos in memory care, keeping the context in mind.`;
      } else if (type === "health") {
         prompt = `Considering the following context:\n${contextPrompt}\n\nThe user also shared health data ${metadata.note ? `with the note "${metadata.note}"` : ''}. Data includes BP: ${metadata.bloodPressure}, Temp: ${metadata.temperature}, HR: ${metadata.heartRate}, O2: ${metadata.oxygen}. Please provide an analysis and recommendations related to these readings and how they might relate to cognitive health, keeping the context in mind.`;
      }
      // No need for specific case_study prompt here anymore, it's handled above

      // --- End Modify Context Prompt Generation ---


      const response = await getModelResponse(prompt);

      let responseType: MessageType = "text";
      let responseMetadata = {};

      // --- Adjust Response Type/Metadata based on AI response or original type ---
      // Example: If the AI response discusses medication based on the case study
      if (response.toLowerCase().includes("medication") || response.toLowerCase().includes("medicine")) {
         responseType = "reminder"; // Or keep as 'text' but add metadata
         responseMetadata = {
           // Extract details if possible, otherwise use placeholders
           medicationName: "Medication mentioned",
           schedule: "As discussed",
           nextDose: "Follow instructions"
         };
      } else if (type === "health") { // Keep health response specific
         responseType = "health";
         responseMetadata = {
           assessment: "Analysis based on data", // Update with actual analysis if possible
           recommendations: ["Follow general health advice", "Consult doctor if concerned"] // Update with actual recommendations
         };
      } else if (type === "case_study") {
         // Keep response type as text for case study analysis
         responseType = "text";
         responseMetadata = { analysisSummary: "AI analysis of case study." }; // Placeholder
      }
      // --- End Adjust Response Type/Metadata ---


      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
        type: responseType,
        metadata: responseMetadata,
        // Mark important based on keywords in user message OR AI response
        important: content.toLowerCase().includes("medicine") || content.toLowerCase().includes("medication") || response.toLowerCase().includes("important") || response.toLowerCase().includes("critical"),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an issue processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "AI Model Error",
        description: "There was an error generating a response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuestion = (question: string) => {
    setInput(question);
  };

  // --- Add handleCopy function ---
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Message content copied.",
      });
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy message to clipboard.",
        variant: "destructive",
      });
    });
  };
  // --- End handleCopy function ---

  const markAsImportant = (messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, important: !message.important } 
          : message
      )
    );
    
    toast({
      title: "Message marked as important",
      description: "This message will be saved for future reference.",
    });
  };

  const clearPatientContext = () => {
    setPatientContext(null); // This now clears patient, caseStudy, and uploadedCaseStudy

    const systemMessage: Message = {
      id: Date.now().toString(),
      content: "Patient data and uploaded case study context have been cleared. You're now in general conversation mode.",
      role: "assistant",
      timestamp: new Date(),
      type: "text"
    };

    setMessages((prev) => [...prev, systemMessage]);

    toast({
      title: "Context Cleared",
      description: "You have returned to general conversation mode.",
    });
  };

  const renderMessage = (message: Message) => {
    const formattedContent = formatMessageContent(message.content);

    return (
      <div
        key={message.id}
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`flex gap-3 max-w-[80%] ${
            message.role === "user" ? "flex-row-reverse" : ""
          }`}
        >
          <Avatar className={message.role === "assistant" ? "bg-memora-purple" : "bg-gray-300"}>
            <div className="text-white">
              {message.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
            </div>
          </Avatar>
          <div
            className={`rounded-2xl px-4 py-3 relative group ${ // Added 'group' for hover effect
              message.role === "assistant"
                ? "bg-white border border-memora-purple/10 shadow-sm"
                : "bg-memora-purple text-white"
            } ${message.important ? "border-l-4 border-amber-400 shadow-lg" : ""}`}
          >
            {message.type === "image" && message.metadata?.imagePath && (
              <div className="mb-3">
                <img 
                  src={message.metadata.imagePath} 
                  alt={message.metadata.caption || "Shared image"} 
                  className="rounded-lg max-h-40 w-auto"
                />
                <p className="text-xs mt-1 text-gray-500">{message.metadata.caption}</p>
              </div>
            )}
            
            {message.type === "health" && message.role === "assistant" && message.metadata && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Health Assessment</p>
                <ul className="mt-1 space-y-1">
                  {message.metadata.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-700"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {message.type === "reminder" && message.metadata && (
              <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Medication Reminder</p>
                <p className="text-xs mt-1 text-purple-600">{message.metadata.medicationName}: {message.metadata.nextDose}</p>
              </div>
            )}
            
            {/* --- Render the formatted content --- */}
            <div className="text-sm">
              {formattedContent}
            </div>
            {/* --- End Render --- */}
            
            {message.role === "assistant" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute bottom-1 right-1 h-6 w-6 rounded-full p-0 opacity-70 hover:opacity-100"
                onClick={() => markAsImportant(message.id)}
              >
                <Star className={`h-4 w-4 ${message.important ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                <span className="sr-only">Mark as important</span>
              </Button>
            )}
             {/* --- End Updated Message Actions --- */}
          </div>
        </div>
      </div>
    );
  };

  const getInsights = () => {
    return [
      {
        title: "Memory Status",
        description: "Short-term memory shows moderate decline compared to last week",
        change: "decline",
        data: {
          current: 65,
          previous: 72
        }
      },
      {
        title: "Conversation Topics",
        description: "Most frequent topics: medications, family, daily activities",
        change: "neutral",
        data: {
          medications: 42,
          family: 28,
          activities: 18,
          other: 12
        }
      },
      {
        title: "Emotional Wellbeing",
        description: "Sentiment analysis shows improved mood from previous sessions",
        change: "improvement",
        data: {
          current: 78,
          previous: 65
        }
      }
    ];
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[80vh]">
      <div className="bg-green-100 mb-4 p-3 rounded-lg flex items-center">
        <Brain className="h-5 w-5 text-green-700 mr-2" />
        <span className="text-sm">Using <span className="font-medium">Gemini 2.0 Flash</span> model</span>
        {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin text-green-700" />}
      </div>
      
      {patientContext && (
        <div className="bg-memora-purple/10 mb-4 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-memora-purple" />
            <span className="font-medium text-sm">Patient Mode: {patientContext.patient?.name}</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
              {patientContext.patient?.stage.charAt(0).toUpperCase() + patientContext.patient?.stage.slice(1)} Stage
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7"
            onClick={clearPatientContext}
          >
            <X className="h-3 w-3 mr-1" />
            Clear Patient
          </Button>
        </div>
      )}
      
      <Tabs 
        defaultValue="chat" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "chat" | "insights" | "questions")}
        className="w-full mb-4"
      >
        <TabsList className="grid grid-cols-3 w-full mb-2">
          <TabsTrigger value="chat">Conversation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="questions">
            Patient Questions
            {patientContext && <span className="ml-1 text-xs bg-memora-purple text-white rounded-full py-0.5 px-1.5">New</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
          <Card className="flex-1 p-4 overflow-y-auto glass-card mb-4">
            <div className="space-y-1 pb-2">
              {messages.map(renderMessage)}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="bg-memora-purple">
                      <div className="text-white">
                        <Bot size={20} />
                      </div>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-3 bg-white border border-memora-purple/10 shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-memora-purple" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
          
          {!patientContext && (
            <div className="mb-4 flex flex-wrap gap-2">
              {sampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleQuestion(question)}
                  className="text-xs bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-sm"
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
          
          {patientContext && (
            <div className="mb-4 flex flex-wrap gap-2">
              {generatedPatientQuestions.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleQuestion(question)}
                  className="text-xs bg-white/80 hover:bg-white"
                >
                  {question.length > 40 ? question.substring(0, 37) + "..." : question}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("questions")}
                className="text-xs bg-white/80 hover:bg-white"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                More questions
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="resize-none bg-white/80 text-lg pr-10 shadow-sm"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 bottom-2"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setAttachmentType("image")}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Share Family Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setAttachmentType("health")}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Share Health Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => setAttachmentType("question")}
                    >
                      <MessageCircleQuestion className="mr-2 h-4 w-4" />
                      Ask About Memory
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || (!input.trim() && attachmentType === "none")}
              className="bg-memora-purple hover:bg-memora-purple-dark transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
          
          {attachmentType !== "none" && (
            <div className="flex items-center gap-2 text-sm text-memora-purple font-medium">
              {attachmentType === "image" && <Image className="h-4 w-4" />}
              {attachmentType === "health" && <Activity className="h-4 w-4" />}
              {attachmentType === "question" && <MessageCircleQuestion className="h-4 w-4" />}
              <span>
                {attachmentType === "image" && "Family photo selected"}
                {attachmentType === "health" && "Health data ready to share"}
                {attachmentType === "question" && "Memory question ready"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAttachmentType("none")} 
                className="p-0 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1">
          <Card className="glass-card p-4">
            <h3 className="text-lg font-medium mb-4">AI-Generated Insights</h3>
            <div className="space-y-4">
              {getInsights().map((insight, index) => (
                <div key={index} className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      insight.change === "improvement" ? "text-green-600" : 
                      insight.change === "decline" ? "text-red-600" : "text-blue-600"
                    }`}>
                      {insight.change === "improvement" && "▲"}
                      {insight.change === "decline" && "▼"}
                      {insight.change === "neutral" && "●"}
                      <span>{insight.change === "improvement" ? "Improving" : 
                             insight.change === "decline" ? "Declining" : "Stable"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
              
              <p className="text-sm text-muted-foreground mt-4">
                These insights are generated based on conversation analysis and pattern recognition. 
                They are intended to provide general guidance and should be discussed with healthcare professionals.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="flex-1">
          {patientContext ? (
            <Card className="glass-card p-4">
              <h3 className="text-lg font-medium mb-2">Questions for {patientContext.patient?.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These questions are generated based on the patient's profile and case study. Click on any question to use it in the chat.
              </p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {generatedPatientQuestions.map((question, index) => (
                  <div 
                    key={index} 
                    className="bg-white/80 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white transition-colors shadow-sm"
                    onClick={() => {
                      handleSampleQuestion(question);
                      setActiveTab("chat");
                    }}
                  >
                    <p className="text-sm">{question}</p>
                    <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <QuestionGenerator />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
