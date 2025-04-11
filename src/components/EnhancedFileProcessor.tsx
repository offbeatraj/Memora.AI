
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  FileText,
  FileImage,
  File,
  Loader2,
  Check,
  Brain,
  List,
  Filter,
  Search,
  Calendar,
  Download,
  Trash2
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: "processing" | "complete" | "error";
  insights?: string[];
  thumbnail?: string;
  previewUrl?: string;
  patientId?: string;
  patientName?: string;
}

export default function EnhancedFileProcessor() {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<ProcessedFile[]>([
    {
      id: "f1",
      name: "medical_assessment_eleanor.pdf",
      type: "application/pdf",
      size: 2345678,
      uploadDate: new Date(2025, 3, 5),
      status: "complete",
      insights: [
        "Contains memory assessment data",
        "Shows moderate decline in short-term memory",
        "Recommends memory exercises"
      ],
      patientId: "p1",
      patientName: "Eleanor Johnson"
    },
    {
      id: "f2",
      name: "brain_scan_results.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 1567890,
      uploadDate: new Date(2025, 3, 2),
      status: "complete",
      insights: [
        "Contains MRI scan interpretation",
        "Shows hippocampal atrophy consistent with Alzheimer's",
        "Recommends follow-up in 6 months"
      ],
      patientId: "p1",
      patientName: "Eleanor Johnson"
    },
    {
      id: "f3",
      name: "family_photo_beach.jpg",
      type: "image/jpeg",
      size: 3456789,
      uploadDate: new Date(2025, 3, 6),
      status: "complete",
      thumbnail: "/placeholder.svg",
      insights: [
        "Family photo from summer 2024",
        "Contains 5 identified family members",
        "Tagged as 'beach vacation'"
      ],
      patientId: "p2",
      patientName: "Robert Wilson"
    }
  ]);
  const { toast } = useToast();

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add mock processed files
          const mockNewFile: ProcessedFile = {
            id: `f${files.length + 1}`,
            name: "medical_notes_april.pdf",
            type: "application/pdf",
            size: 1876543,
            uploadDate: new Date(),
            status: "complete",
            insights: [
              "Contains physician notes from April appointment",
              "Mentions medication adjustment",
              "Lists cognitive test scores"
            ],
            patientId: "p1",
            patientName: "Eleanor Johnson"
          };
          
          setFiles(prev => [...prev, mockNewFile]);
          
          toast({
            title: "File processed successfully",
            description: "AI analysis has extracted key information from your document.",
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <File className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('word')) {
      return <FileText className="h-5 w-5 text-indigo-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast({
      title: "File deleted",
      description: "The file has been removed from the system.",
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle>Enhanced Document Processing</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "library")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload & Process
            </TabsTrigger>
            <TabsTrigger value="library">
              <List className="h-4 w-4 mr-2" />
              Document Library
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="bg-white/70 p-6 rounded-lg border-2 border-dashed border-memora-purple/30">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-memora-purple/70" />
                <h3 className="text-lg font-medium mb-2">AI-Powered Document Processing</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload medical records, personal memories, and other documents to extract insights and add to patient records.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">Medical Records</p>
                    <p className="text-xs text-muted-foreground">Extract diagnoses, treatments and medical history</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <FileImage className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">Personal Photos</p>
                    <p className="text-xs text-muted-foreground">Identify people and create memory prompts</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium">Assessments</p>
                    <p className="text-xs text-muted-foreground">Analyze cognitive test results</p>
                  </div>
                </div>
                
                {isUploading ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Processing document...</p>
                      <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="mt-4 space-y-2 text-left">
                      <p className="text-sm flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Document uploaded successfully</span>
                      </p>
                      {uploadProgress >= 30 && (
                        <p className="text-sm flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Text extraction complete</span>
                        </p>
                      )}
                      {uploadProgress >= 60 && (
                        <p className="text-sm flex items-center gap-1">
                          {uploadProgress >= 90 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-memora-purple" />
                          )}
                          <span>AI analysis in progress</span>
                        </p>
                      )}
                      {uploadProgress >= 90 && (
                        <p className="text-sm flex items-center gap-1">
                          {uploadProgress >= 100 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-memora-purple" />
                          )}
                          <span>Generating insights and summaries</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={simulateUpload}
                    className="bg-memora-purple hover:bg-memora-purple-dark w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files to Upload
                  </Button>
                )}
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 20MB)
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Recent Uploads</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {files.slice(0, 3).map((file) => (
                <div key={file.id} className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
                  {file.thumbnail ? (
                    <div className="h-12 w-12 rounded overflow-hidden shrink-0">
                      <img src={file.thumbnail} alt={file.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        {file.patientName}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="library">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  className="w-full pl-8 pr-4 py-2 bg-white/70 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {files.map((file) => (
                <div key={file.id} className="bg-white/70 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {file.thumbnail ? (
                      <div className="h-12 w-12 rounded overflow-hidden shrink-0">
                        <img src={file.thumbnail} alt={file.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{file.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          {file.patientName}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {file.insights && file.insights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Brain className="h-4 w-4 text-memora-purple" />
                        AI Insights
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {file.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-memora-purple shrink-0 mt-1.5" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-3 gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
