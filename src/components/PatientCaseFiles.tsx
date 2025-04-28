
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface CaseFile {
  id: string;
  file_name: string;
  file_path: string;
  notes: string | null;
  upload_date: string;
}

interface PatientCaseFilesProps {
  patientId: string;
}

export default function PatientCaseFiles({ patientId }: PatientCaseFilesProps) {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<CaseFile | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCaseFiles();
    
    // Listen for new file uploads
    const handleFileUploaded = (event: CustomEvent<{ patientId: string }>) => {
      if (event.detail.patientId === patientId) {
        fetchCaseFiles();
      }
    };
    
    document.addEventListener('patientFileUploaded', handleFileUploaded as EventListener);
    
    return () => {
      document.removeEventListener('patientFileUploaded', handleFileUploaded as EventListener);
    };
  }, [patientId]);

  const fetchCaseFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('id, file_name, file_path, notes, upload_date')
        .eq('patient_id', patientId)
        .eq('file_category', 'case')
        .order('upload_date', { ascending: false });
        
      if (error) throw error;
      setCaseFiles(data || []);
    } catch (error) {
      console.error("Error fetching case files:", error);
      toast({
        title: "Error",
        description: "Failed to load case files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (file: CaseFile) => {
    setSelectedFile(file);
    setOpenDialog(true);
  };

  const handleDownloadFile = async (file: CaseFile) => {
    try {
      // Extract just the file path portion from the URL if it's a full URL
      const path = file.file_path.includes('patient-files/') 
        ? file.file_path.split('patient-files/')[1] 
        : file.file_path;
      
      const { data, error } = await supabase.storage
        .from('patient-files')
        .download(path);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Download started",
        description: `Downloading ${file.file_name}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Case Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-memora-purple border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading case files...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Case Files</CardTitle>
      </CardHeader>
      <CardContent>
        {caseFiles.length > 0 ? (
          <div className="space-y-3">
            {caseFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-memora-purple/10 p-2 rounded-md">
                    <FileText className="h-5 w-5 text-memora-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleViewFile(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-10 w-10 text-gray-300 mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">No case files uploaded yet</p>
            <p className="text-xs text-muted-foreground">
              Upload case files from the "Upload" section or use the example case scenarios to provide context to the AI assistant
            </p>
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedFile?.file_name}
                <Badge className="ml-2 bg-memora-purple">{new Date(selectedFile?.upload_date || "").toLocaleDateString()}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">
              {selectedFile?.notes || "No content available"}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
