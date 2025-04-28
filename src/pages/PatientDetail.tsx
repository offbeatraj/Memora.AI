import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import FileUploader from "@/components/FileUploader";
import {
  User,
  Brain,
  FileText,
  Calendar,
  Clock,
  SquareCheck,
  PenLine,
  FileQuestion,
  UploadCloud,
  DownloadCloud,
  Heart,
  Utensils,
  Activity,
  MessageCircle,
  Save,
  X
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Updated interface to match database schema
interface CareTask {
  id: string;
  title: string;
  description: string;
  frequency: string;
  status: "pending" | "completed" | "overdue";
  patient_id?: string;
  created_at?: string;
  due_date?: string;
}

interface DietItem {
  meal: string;
  food: string;
  time: string;
  notes?: string;
  id?: string;
  patient_id?: string;
  created_at?: string;
}

// Updated interface to match database schema
interface PatientNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: "medical" | "caregiver" | "cognitive" | "other";
  patient_id?: string;
  title?: string;
  created_at?: string;
  note_type?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  stage: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  primaryPhysician?: string;
  medications?: Array<{name: string; dosage: string; frequency: string}>;
  allergies?: string[];
  medicalHistory?: string[];
  cognitiveSummary?: {
    memory: string;
    language: string;
    attention: string;
    visualSpatial: string;
    lastAssessment: string;
  };
  photo?: string;
  caregiver_name?: string;
  notes?: string;
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("careplan");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditPatientMode, setIsEditPatientMode] = useState(false);
  const [isEditDietMode, setIsEditDietMode] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingDiet, setLoadingDiet] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [dietPlan, setDietPlan] = useState<DietItem[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  
  // New task form
  const [newTask, setNewTask] = useState<Omit<CareTask, 'id'>>({
    title: '',
    description: '',
    frequency: '',
    status: 'pending'
  });

  // New diet item form
  const [newDietItem, setNewDietItem] = useState<Omit<DietItem, 'id'>>({
    meal: '',
    food: '',
    time: '',
    notes: ''
  });

  // New note form
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'caregiver' as "medical" | "caregiver" | "cognitive" | "other",
    author: ''
  });
  
  // Edit patient form
  const [editPatient, setEditPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatient();
      fetchCareTasks();
      fetchDietPlan();
      fetchNotes();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setPatient(data);
        setEditPatient(data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: "Error",
        description: "Could not load patient information.",
        variant: "destructive"
      });
    }
  };

  const fetchCareTasks = async () => {
    try {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from('patient_tasks')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database results to CareTask type with proper status typing
      const typedTasks: CareTask[] = (data || []).map(task => ({
        ...task,
        status: task.status as "pending" | "completed" | "overdue"
      }));
      
      setCareTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching care tasks:', error);
      toast({
        title: "Error",
        description: "Could not load care tasks.",
        variant: "destructive"
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchDietPlan = async () => {
    try {
      setLoadingDiet(true);
      const { data, error } = await supabase
        .from('patient_diet')
        .select('*')
        .eq('patient_id', id);
      
      if (error) throw error;
      
      setDietPlan(data || []);
    } catch (error) {
      console.error('Error fetching diet plan:', error);
      toast({
        title: "Error",
        description: "Could not load diet plan.",
        variant: "destructive"
      });
    } finally {
      setLoadingDiet(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database results to PatientNote type
      const typedNotes: PatientNote[] = (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        author: note.author,
        date: note.created_at,  // Map created_at to date
        type: note.note_type as "medical" | "caregiver" | "cognitive" | "other",  // Map note_type to type with proper typing
        patient_id: note.patient_id,
        created_at: note.created_at,
        note_type: note.note_type
      }));
      
      setNotes(typedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Could not load notes.",
        variant: "destructive"
      });
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddTask = async () => {
    try {
      if (!newTask.title || !newTask.description || !newTask.frequency) {
        toast({
          title: "Validation Error",
          description: "Please fill out all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('patient_tasks')
        .insert({
          patient_id: id,
          title: newTask.title,
          description: newTask.description,
          frequency: newTask.frequency,
          status: newTask.status
        })
        .select();

      if (error) throw error;

      // Create properly typed task from returned data
      const newTaskWithType: CareTask = {
        ...data[0],
        status: data[0].status as "pending" | "completed" | "overdue"
      };
      
      setCareTasks([...careTasks, newTaskWithType]);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        frequency: '',
        status: 'pending'
      });
      
      toast({
        title: "Success",
        description: "Care task added successfully."
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Could not add task.",
        variant: "destructive"
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: "pending" | "completed" | "overdue") => {
    try {
      const { error } = await supabase
        .from('patient_tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setCareTasks(careTasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      
      toast({
        title: "Success",
        description: "Task status updated."
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Could not update task status.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('patient_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      setCareTasks(careTasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Success",
        description: "Task removed successfully."
      });
    } catch (error) {
      console.error('Error removing task:', error);
      toast({
        title: "Error",
        description: "Could not remove task.",
        variant: "destructive"
      });
    }
  };

  const handleSavePatient = async () => {
    if (!editPatient) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .update(editPatient)
        .eq('id', id);
      
      if (error) throw error;
      
      setPatient(editPatient);
      setIsEditPatientMode(false);
      
      toast({
        title: "Success",
        description: "Patient information updated."
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Could not update patient information.",
        variant: "destructive"
      });
    }
  };

  const handleAddDietItem = async () => {
    try {
      if (!newDietItem.meal || !newDietItem.food || !newDietItem.time) {
        toast({
          title: "Validation Error",
          description: "Please fill out all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('patient_diet')
        .insert({
          patient_id: id,
          meal: newDietItem.meal,
          food: newDietItem.food,
          time: newDietItem.time,
          notes: newDietItem.notes || null
        })
        .select();

      if (error) throw error;

      setDietPlan([...dietPlan, data[0]]);
      
      // Reset form
      setNewDietItem({
        meal: '',
        food: '',
        time: '',
        notes: ''
      });
      
      toast({
        title: "Success",
        description: "Diet item added successfully."
      });
    } catch (error) {
      console.error('Error adding diet item:', error);
      toast({
        title: "Error",
        description: "Could not add diet item.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveDietItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('patient_diet')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      setDietPlan(dietPlan.filter(item => item.id !== itemId));
      
      toast({
        title: "Success",
        description: "Diet item removed successfully."
      });
    } catch (error) {
      console.error('Error removing diet item:', error);
      toast({
        title: "Error",
        description: "Could not remove diet item.",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async () => {
    try {
      if (!newNote.title || !newNote.content || !newNote.author) {
        toast({
          title: "Validation Error",
          description: "Please fill out all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('patient_notes')
        .insert({
          patient_id: id,
          title: newNote.title,
          content: newNote.content,
          author: newNote.author,
          note_type: newNote.type
        })
        .select();

      if (error) throw error;

      // Format the note to match PatientNote interface
      const formattedNote: PatientNote = {
        id: data[0].id,
        title: data[0].title,
        content: data[0].content,
        author: data[0].author,
        date: data[0].created_at,
        type: data[0].note_type as "medical" | "caregiver" | "cognitive" | "other",
        patient_id: data[0].patient_id,
        created_at: data[0].created_at,
        note_type: data[0].note_type
      };

      setNotes([formattedNote, ...notes]);
      
      // Reset form
      setNewNote({
        title: '',
        content: '',
        type: 'caregiver' as "medical" | "caregiver" | "cognitive" | "other",
        author: ''
      });
      
      toast({
        title: "Success",
        description: "Note added successfully."
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Could not add note.",
        variant: "destructive"
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "caregiver":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cognitive":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!patient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-memora-purple border-t-transparent rounded-full"></div>
          <p className="ml-3 text-muted-foreground">Loading patient data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
          <Card className="glass-card w-full md:w-1/3">
            <CardContent className="pt-6">
              {isEditPatientMode ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Edit Patient</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditPatientMode(false);
                        setEditPatient(patient);
                      }}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-memora-purple" onClick={handleSavePatient}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  {editPatient && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Patient Name</Label>
                        <Input 
                          id="name" 
                          value={editPatient.name}
                          onChange={(e) => setEditPatient({...editPatient, name: e.target.value})}
                          className="bg-white/70"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <Input 
                            id="age" 
                            type="number"
                            value={editPatient.age}
                            onChange={(e) => setEditPatient({...editPatient, age: parseInt(e.target.value) || 0})}
                            className="bg-white/70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            value={editPatient.gender}
                            onChange={(e) => setEditPatient({...editPatient, gender: e.target.value})}
                            className="w-full h-10 px-3 py-2 rounded-md border bg-white/70"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input 
                          id="diagnosis" 
                          value={editPatient.diagnosis}
                          onChange={(e) => setEditPatient({...editPatient, diagnosis: e.target.value})}
                          className="bg-white/70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stage">Stage</Label>
                        <select
                          id="stage"
                          value={editPatient.stage}
                          onChange={(e) => setEditPatient({...editPatient, stage: e.target.value})}
                          className="w-full h-10 px-3 py-2 rounded-md border bg-white/70"
                        >
                          <option value="early">Early</option>
                          <option value="moderate">Moderate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="caregiver">Caregiver Name</Label>
                        <Input 
                          id="caregiver" 
                          value={editPatient.caregiver_name || ''}
                          onChange={(e) => setEditPatient({...editPatient, caregiver_name: e.target.value})}
                          className="bg-white/70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea 
                          id="notes" 
                          value={editPatient.notes || ''}
                          onChange={(e) => setEditPatient({...editPatient, notes: e.target.value})}
                          className="bg-white/70"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-4">
                    <Avatar className="h-24 w-24 mb-3">
                      {patient.photo ? (
                        <img src={patient.photo} alt={patient.name} />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </Avatar>
                    <h1 className="text-2xl font-bold">{patient.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        {patient.diagnosis}
                      </Badge>
                      <Badge variant="outline" className={
                        patient.stage === "early" ? "bg-green-100 text-green-800 border-green-200" :
                        patient.stage === "moderate" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        "bg-red-100 text-red-800 border-red-200"
                      }>
                        {patient.stage.charAt(0).toUpperCase() + patient.stage.slice(1)} Stage
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/70 p-3 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <User className="h-4 w-4 text-memora-purple" />
                        Personal Information
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Age:</span> {patient.age}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {patient.gender}</p>
                        {patient.dateOfBirth && <p><span className="text-muted-foreground">Date of Birth:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>}
                        {patient.phone && <p><span className="text-muted-foreground">Phone:</span> {patient.phone}</p>}
                        {patient.address && <p><span className="text-muted-foreground">Address:</span> {patient.address}</p>}
                      </div>
                    </div>
                    
                    <div className="bg-white/70 p-3 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Heart className="h-4 w-4 text-memora-purple" />
                        Medical Information
                      </h3>
                      <div className="space-y-1 text-sm">
                        {patient.primaryPhysician && <p><span className="text-muted-foreground">Primary Physician:</span> {patient.primaryPhysician}</p>}
                        {patient.emergencyContact && <p><span className="text-muted-foreground">Emergency Contact:</span> {patient.emergencyContact}</p>}
                        {patient.caregiver_name && <p><span className="text-muted-foreground">Caregiver:</span> {patient.caregiver_name}</p>}
                        {patient.allergies && <p><span className="text-muted-foreground">Allergies:</span> {patient.allergies.join(", ")}</p>}
                      </div>
                    </div>
                    
                    {patient.cognitiveSummary && (
                      <div className="bg-white/70 p-3 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center gap-1">
                          <Brain className="h-4 w-4 text-memora-purple" />
                          Cognitive Status
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Memory:</span> {patient.cognitiveSummary.memory}</p>
                          <p><span className="text-muted-foreground">Language:</span> {patient.cognitiveSummary.language}</p>
                          <p><span className="text-muted-foreground">Attention:</span> {patient.cognitiveSummary.attention}</p>
                          <p><span className="text-muted-foreground">Visual-Spatial:</span> {patient.cognitiveSummary.visualSpatial}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Last assessment: {new Date(patient.cognitiveSummary.lastAssessment).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => setIsEditPatientMode(true)}
                    >
                      <PenLine className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="w-full md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="careplan">
                  <SquareCheck className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Care Plan</span>
                </TabsTrigger>
                <TabsTrigger value="diet">
                  <Utensils className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Diet Plan</span>
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <MessageCircle className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileQuestion className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Documents</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="careplan">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-memora-purple" />
                        Care Plan
                      </CardTitle>
                      <Button 
                        variant={isEditMode ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={isEditMode ? "bg-memora-purple hover:bg-memora-purple-dark" : ""}
                      >
                        <PenLine className="h-4 w-4 mr-1" />
                        {isEditMode ? "Done" : "Edit Plan"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingTasks ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin h-6 w-6 border-4 border-memora-purple border-t-transparent rounded-full"></div>
                        <p className="ml-3 text-muted-foreground">Loading care tasks...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {careTasks.length > 0 ? careTasks.map((task) => (
                          <div key={task.id} className="bg-white/70 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{task.frequency}</span>
                            </div>
                            
                            {isEditMode && (
                              <div className="mt-3 flex justify-end gap-2">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value as "pending" | "completed" | "overdue")}
                                  className="text-sm h-9 bg-white/80 rounded border px-2 mr-auto"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                                <Button variant="destructive" size="sm" onClick={() => handleRemoveTask(task.id)}>
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        )) : (
                          <div className="text-center py-10 bg-white/50 rounded-lg">
                            <SquareCheck className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                            <p className="text-muted-foreground">No care tasks have been added yet</p>
                          </div>
                        )}
                        
                        {isEditMode && (
                          <div className="bg-white/70 p-4 rounded-lg border-2 border-dashed border-memora-purple/30">
                            <h3 className="font-medium mb-3">Add New Care Task</h3>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="new-task-title">Task Title</Label>
                                <Input 
                                  id="new-task-title" 
                                  placeholder="Enter task title" 
                                  className="bg-white/70"
                                  value={newTask.title}
                                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-task-description">Description</Label>
                                <Textarea 
                                  id="new-task-description" 
                                  placeholder="Enter task description" 
                                  className="bg-white/70"
                                  value={newTask.description}
                                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-task-frequency">Frequency</Label>
                                <Input 
                                  id="new-task-frequency" 
                                  placeholder="E.g., Daily, Weekly, As needed" 
                                  className="bg-white/70"
                                  value={newTask.frequency}
                                  onChange={(e) => setNewTask({...newTask, frequency: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-task-status">Status</Label>
                                <select
                                  id="new-task-status"
                                  className="w-full h-10 px-3 py-2 rounded-md border bg-white/70"
                                  value={newTask.status}
                                  onChange={(e) => setNewTask({...newTask, status: e.target.value as "pending" | "completed" | "overdue"})}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                              </div>
                              <Button 
                                className="w-full bg-memora-purple hover:bg-memora-purple-dark"
                                onClick={handleAddTask}
                              >
                                Add Task
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="diet">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-memora-purple" />
                        Nutrition & Diet Plan
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditDietMode(!isEditDietMode)}
                        className={isEditDietMode ? "bg-memora-purple text-white" : ""}
                      >
                        <PenLine className="h-4 w-4 mr-1" />
                        {isEditDietMode ? "Done" : "Edit Diet"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingDiet ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin h-6 w-6 border-4 border-memora-purple border-t-transparent rounded-full"></div>
                        <p className="ml-3 text-muted-foreground">Loading diet plan...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dietPlan.length > 0 ? dietPlan.map((item) => (
                          <div key={item.id} className="bg-white/70 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{item.meal}</h3>
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                {item.time}
                              </Badge>
                            </div>
                            <p className="text-sm mb-1">{item.food}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">Note:</span> {item.notes}
                              </p>
                            )}
                            {isEditDietMode && (
                              <div className="mt-3 flex justify-end">
                                <Button variant="destructive" size="sm" onClick={() => handleRemoveDietItem(item.id!)}>
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        )) : (
                          <div className="text-center py-10 bg-white/50 rounded-lg">
                            <Utensils className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                            <p className="text-muted-foreground">No diet items have been added yet</p>
                          </div>
                        )}
                        
                        {isEditDietMode && (
                          <div className="bg-white/70 p-4 rounded-lg border-2 border-dashed border-memora-purple/30">
                            <h3 className="font-medium mb-3">Add New Diet Item</h3>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="meal-type">Meal</Label>
                                <Input 
                                  id="meal-type" 
                                  placeholder="e.g. Breakfast, Lunch, Dinner" 
                                  className="bg-white/70"
                                  value={newDietItem.meal}
                                  onChange={(e) => setNewDietItem({...newDietItem, meal: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="food">Food</Label>
                                <Input 
                                  id="food" 
                                  placeholder="e.g. Oatmeal with berries" 
                                  className="bg-white/70"
                                  value={newDietItem.food}
                                  onChange={(e) => setNewDietItem({...newDietItem, food: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="time">Time</Label>
                                <Input 
                                  id="time" 
                                  placeholder="e.g. 8:00 AM" 
                                  className="bg-white/70"
                                  value={newDietItem.time}
                                  onChange={(e) => setNewDietItem({...newDietItem, time: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea 
                                  id="notes" 
                                  placeholder="Any special instructions or notes" 
                                  className="bg-white/70"
                                  value={newDietItem.notes}
                                  onChange={(e) => setNewDietItem({...newDietItem, notes: e.target.value})}
                                />
                              </div>
                              <Button 
                                className="w-full bg-memora-purple hover:bg-memora-purple-dark"
                                onClick={handleAddDietItem}
                              >
                                Add Diet Item
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50/70 p-4 rounded-lg">
                          <h3 className="font-medium mb-2 text-blue-800">Dietary Recommendations</h3>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Maintain a Mediterranean-style diet rich in fruits, vegetables, and lean proteins</li>
                            <li>• Limit sugar intake, especially processed foods and sweetened beverages</li>
                            <li>• Ensure adequate hydration throughout the day (reminder: at least 6 glasses of water)</li>
                            <li>• Monitor for difficulty swallowing and adjust food textures as needed</li>
                            <li>• Small, frequent meals may be better tolerated than three large meals</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-memora-purple" />
                        Patient Notes
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingNotes ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin h-6 w-6 border-4 border-memora-purple border-t-transparent rounded-full"></div>
                        <p className="ml-3 text-muted-foreground">Loading notes...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notes.length > 0 ? notes.map((note) => (
                          <div key={note.id} className="bg-white/70 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{note.title || note.author}</h3>
                              <Badge variant="outline" className={getNoteTypeColor(note.type)}>
                                {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{note.content}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{new Date(note.date).toLocaleDateString()}</span>
                              </div>
                              <div>
                                {note.author}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10 bg-white/50 rounded-lg">
                            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                            <p className="text-muted-foreground">No notes have been added yet</p>
                          </div>
                        )}
                        
                        <div className="bg-white/70 p-4 rounded-lg border-2 border-dashed border-memora-purple/30">
                          <h3 className="font-medium mb-3">Add New Note</h3>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="note-type">Note Type</Label>
                              <select 
                                id="note-type" 
                                className="w-full h-10 px-3 py-2 rounded-md border bg-white/70"
                                value={newNote.type}
                                onChange={(e) => setNewNote({...newNote, type: e.target.value as "medical" | "caregiver" | "cognitive" | "other"})}
                              >
                                <option value="medical">Medical</option>
                                <option value="caregiver">Caregiver</option>
                                <option value="cognitive">Cognitive</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="note-title">Title</Label>
                              <Input 
                                id="note-title" 
                                placeholder="Enter note title" 
                                className="bg-white/70"
                                value={newNote.title}
                                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="note-author">Author</Label>
                              <Input 
                                id="note-author" 
                                placeholder="Enter your name" 
                                className="bg-white/70"
                                value={newNote.author}
                                onChange={(e) => setNewNote({...newNote, author: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="note-content">Note Content</Label>
                              <Textarea 
                                id="note-content" 
                                placeholder="Enter your note here..." 
                                className="bg-white/70" 
                                rows={4}
                                value={newNote.content}
                                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                              />
                            </div>
                            <Button 
                              className="w-full bg-memora-purple hover:bg-memora-purple-dark"
                              onClick={handleAddNote}
                            >
                              Save Note
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <FileQuestion className="h-5 w-5 text-memora-purple" />
                        Patient Documents
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FileUploader />
                      
                      <div className="mt-4 space-y-4">
                        <h3 className="text-lg font-medium">Uploaded Documents</h3>
                        
                        <div className="bg-white/70 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Medical Assessment Report</h3>
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Medical
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">Comprehensive neurological assessment - Dr. Sarah Williams</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>April 2, 2025</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <DownloadCloud className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white/70 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Brain MRI Scan Results</h3>
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Medical
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">Riverside Medical Center - Radiology Department</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>March 28, 2025</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <DownloadCloud className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
