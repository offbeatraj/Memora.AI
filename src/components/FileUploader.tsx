
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Loader2, Check, FileImage, File as FileIcon, Edit3, UserPlus, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, uploadPatientFile } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [fileType, setFileType] = useState<"medical" | "personal" | "other" | "case">("medical");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [caseText, setCaseText] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [showPatientOptions, setShowPatientOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setPatientId(id);
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId && fileType !== "case") {
      toast({
        title: "Patient not found",
        description: "Please ensure you're viewing a patient's profile before uploading files.",
        variant: "destructive",
      });
      return;
    }

    if (fileType === "case" && !patientId) {
      setShowPatientOptions(true);
      return;
    }

    setUploading(true);
    
    try {
      if (uploadMode === "file" && files.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select at least one file to upload.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      if (uploadMode === "text" && fileType === "case") {
        if (!caseText.trim()) {
          toast({
            title: "No case text entered",
            description: "Please enter case details in the text field.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
        
        const titleToUse = caseTitle || "Case Scenario";
        const fileName = `${titleToUse.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        
        const blob = new Blob([caseText], { type: "text/plain" });
        const file = new File([blob], fileName, { type: "text/plain" });
        
        const fileUrl = await uploadPatientFile(
          file,
          patientId,
          "case",
          caseText
        );
        
        const fileUploadEvent = new CustomEvent('patientFileUploaded', {
          detail: {
            patientId,
            fileUrl,
            fileType: "case",
            fileName
          }
        });
        document.dispatchEvent(fileUploadEvent);
        
      } else if (uploadMode === "file") {
        for (const file of files) {
          const fileUrl = await uploadPatientFile(
            file, 
            patientId, 
            fileType,
            notes
          );
          
          const fileUploadEvent = new CustomEvent('patientFileUploaded', {
            detail: {
              patientId,
              fileUrl,
              fileType,
              fileName: file.name
            }
          });
          document.dispatchEvent(fileUploadEvent);
        }
      }
      
      setUploadSuccess(true);
      
      toast({
        title: uploadMode === "text" ? "Case scenario created" : "Files uploaded successfully",
        description: uploadMode === "text" 
          ? "Your case scenario has been saved to the patient's record." 
          : `${files.length} file(s) have been processed and added to the patient's record.`,
      });
      
      setTimeout(() => {
        setFiles([]);
        setNotes("");
        setCaseText("");
        setCaseTitle("");
        setUploadSuccess(false);
        setShowPatientOptions(false);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNewPatient = () => {
    navigate('/patient/new', { 
      state: { 
        fromCaseStudy: true,
        caseTitle: caseTitle || "Case Study",
        caseContent: uploadMode === "text" ? caseText : notes
      } 
    });
  };

  const handleAddToExistingPatient = () => {
    navigate('/patients', { 
      state: { 
        selectForCaseStudy: true,
        caseFiles: files,
        caseNotes: notes,
        caseTitle: caseTitle,
        caseText: caseText,
        uploadMode
      } 
    });
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <FileIcon className="h-5 w-5 text-memora-purple" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <FileImage className="h-5 w-5 text-memora-purple" />;
    } else {
      return <FileText className="h-5 w-5 text-memora-purple" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="file-type" className="block mb-2">
              File Type
            </Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={fileType === "medical" ? "default" : "outline"}
                className={fileType === "medical" ? "bg-memora-purple hover:bg-memora-purple-dark" : ""}
                onClick={() => setFileType("medical")}
              >
                Medical Records
              </Button>
              <Button
                type="button"
                variant={fileType === "personal" ? "default" : "outline"}
                className={fileType === "personal" ? "bg-memora-purple hover:bg-memora-purple-dark" : ""}
                onClick={() => setFileType("personal")}
              >
                Personal Memories
              </Button>
              <Button
                type="button"
                variant={fileType === "case" ? "default" : "outline"}
                className={fileType === "case" ? "bg-memora-purple hover:bg-memora-purple-dark" : ""}
                onClick={() => setFileType("case")}
              >
                Case Files
              </Button>
              <Button
                type="button"
                variant={fileType === "other" ? "default" : "outline"}
                className={fileType === "other" ? "bg-memora-purple hover:bg-memora-purple-dark" : ""}
                onClick={() => setFileType("other")}
              >
                Other Documents
              </Button>
            </div>
          </div>
          
          {fileType === "case" && (
            <div className="mb-6">
              <Label className="block mb-4">Upload Method</Label>
              <Tabs defaultValue="file" value={uploadMode} onValueChange={(value) => setUploadMode(value as "file" | "text")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="text">Write Case Study</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          {(uploadMode === "file" || fileType !== "case") && (
            <div className="mb-6">
              <Label htmlFor="file-upload" className="block mb-2">
                Upload Files
              </Label>
              <div
                className="border-2 border-dashed border-memora-purple/30 rounded-lg p-8 text-center cursor-pointer hover:bg-memora-purple/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-memora-purple" />
                <p className="mb-1 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOCX, JPG, PNG (Max 10MB each)
                </p>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                />
              </div>
            </div>
          )}

          {uploadMode === "text" && fileType === "case" && (
            <div className="mb-6">
              <div className="mb-4">
                <Label htmlFor="case-title" className="block mb-2">
                  Case Title
                </Label>
                <Input
                  id="case-title"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="Enter a title for this case scenario"
                  className="bg-white/70"
                />
              </div>
              <div>
                <Label htmlFor="case-text" className="block mb-2">
                  Case Study Details
                </Label>
                <div className="bg-memora-purple/10 p-3 rounded-md mb-3 text-sm">
                  <p>Write a detailed case scenario about the patient, including:</p>
                  <ul className="list-disc list-inside mt-1 pl-2 space-y-1">
                    <li>Background information (age, diagnosis, living situation)</li>
                    <li>The specific care challenge or situation</li>
                    <li>Any behaviors or symptoms that need to be addressed</li>
                  </ul>
                </div>
                <Textarea
                  id="case-text"
                  value={caseText}
                  onChange={(e) => setCaseText(e.target.value)}
                  placeholder="Example: Pam is a 73-year-old woman diagnosed with Alzheimer's disease who lives with her daughter. One night, her daughter is awakened at 2 a.m. by Pam anxiously getting ready for work (even though she retired 7 years ago)..."
                  className="bg-white/70 min-h-[200px]"
                />
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mb-6">
              <Label className="block mb-2">Selected Files</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between bg-white/70 p-2 rounded-md hover:bg-white/90 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(file)}
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(uploadMode === "file" || fileType !== "case") && (
            <div className="mb-6">
              <Label htmlFor="notes" className="block mb-2">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  fileType === "medical" 
                    ? "Add any relevant medical information..." 
                    : fileType === "personal" 
                    ? "Add context about these personal memories..." 
                    : fileType === "case"
                    ? "Describe the patient case scenario in detail..."
                    : "Add any helpful notes about these documents..."
                }
                className="bg-white/70"
              />
            </div>
          )}

          {showPatientOptions && fileType === "case" ? (
            <div className="space-y-4 mb-4">
              <div className="bg-memora-purple/10 p-4 rounded-md text-center">
                <h3 className="font-medium mb-2">What would you like to do with this case study?</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button 
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    onClick={handleCreateNewPatient}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create New Patient
                  </Button>
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    onClick={handleAddToExistingPatient}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Add to Existing Patient
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 text-sm"
                  onClick={() => setShowPatientOptions(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="submit"
              className="w-full bg-memora-purple hover:bg-memora-purple-dark transition-all duration-300"
              disabled={uploading || uploadSuccess}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadSuccess && <Check className="mr-2 h-4 w-4" />}
              {uploading
                ? "Processing..."
                : uploadSuccess
                ? "Successfully Processed"
                : uploadMode === "text" && fileType === "case" 
                  ? "Save Case Study" 
                  : `Upload ${
                      fileType === "medical" 
                        ? "Medical Records" 
                        : fileType === "personal" 
                        ? "Personal Memories" 
                        : fileType === "case"
                        ? "Patient Case Files"
                        : "Documents"
                    }`}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
