
import Layout from "@/components/Layout";
import FileUploader from "@/components/FileUploader";
import MockCaseFile from "@/components/MockCaseFile";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash } from "lucide-react";
import { useParams } from "react-router-dom";

// Define an interface for the recent files
interface RecentFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_category: string;
  upload_date: string;
  patient_name: string;
}

export default function UploadPage() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetchRecentFiles();
    
    // Set patient ID from route params if available
    if (id) {
      setSelectedPatientId(id);
    }
  }, [id]);

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      
      // Fix the type error by properly typing the RPC call
      const { data, error } = await supabase
        .rpc('get_recent_files', { 
          limit_count: 5
        });
      
      if (error) throw error;
      
      setRecentFiles(data as RecentFile[] || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Could not load recent files",
        description: "There was an error loading the recent files.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      // Extract just the file path portion from the URL if it's a full URL
      const path = filePath.includes('patient-files/') 
        ? filePath.split('patient-files/')[1] 
        : filePath;
      
      const { data, error } = await supabase.storage
        .from('patient-files')
        .download(path);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleCaseLoaded = (caseData: any) => {
    toast({
      title: "Case Loaded",
      description: "The sample case has been added to the patient's records.",
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-5 w-5 text-memora-purple" />
            <h1 className="text-2xl font-bold">Upload Information</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Upload medical records, personal memories, case scenarios, or any relevant information 
            to help personalize your experience with Memora.
          </p>
          
          <FileUploader />
          
          {selectedPatientId && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Case Scenarios</h2>
              <MockCaseFile 
                patientId={selectedPatientId} 
                onLoadCase={handleCaseLoaded}
              />
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Recent Uploads</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-memora-purple border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading recent files...</p>
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="bg-white/70 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.file_name}</TableCell>
                        <TableCell>{file.patient_name}</TableCell>
                        <TableCell>{file.file_category}</TableCell>
                        <TableCell>{formatFileSize(file.file_size)}</TableCell>
                        <TableCell>{new Date(file.upload_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownload(file.file_path, file.file_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/70 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-muted-foreground">No files have been uploaded yet</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">How uploaded data is used</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="bg-memora-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</span>
                <span>Your uploads are used to personalize responses and provide more relevant assistance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-memora-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</span>
                <span>All information is kept private and secure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-memora-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</span>
                <span>You can delete uploaded information at any time from your account settings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
