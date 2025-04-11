import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Users, User, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  stage: string;
  last_visit: string;
  caregiverName?: string;
  caregiver_name?: string;
  photo?: string;
}

export default function PatientManager() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<"all" | "early" | "moderate" | "advanced">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchPatients() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select('*');
        
        if (error) {
          console.error('Error fetching patients:', error);
          toast({
            title: "Error fetching patients",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          const formattedData = data.map(patient => ({
            ...patient,
            last_visit: new Date(patient.last_visit).toISOString().split('T')[0],
            caregiverName: patient.caregiver_name
          }));
          
          setPatients(formattedData);
          console.log('Fetched patients:', formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          title: "Error fetching patients",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatients();
  }, [toast]);
  
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStage === "all" || patient.stage === filterStage;
    
    return matchesSearch && matchesFilter;
  });
  
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "early":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-memora-purple" />
            Patient Directory
          </CardTitle>
          <Link to="/patient/new">
            <Button size="sm" className="bg-memora-purple hover:bg-memora-purple-dark">
              <UserPlus className="h-4 w-4 mr-1" />
              Add Patient
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-8 bg-white/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStage("all")}>
                All Stages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStage("early")}>
                Early Stage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStage("moderate")}>
                Moderate Stage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStage("advanced")}>
                Advanced Stage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-memora-purple mb-2" />
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <Link 
                to={`/patient/${patient.id}`} 
                key={patient.id} 
                className="flex items-center gap-3 bg-white/70 p-3 rounded-lg hover:bg-white hover:shadow-md transition-all"
              >
                <Avatar className="h-12 w-12">
                  {patient.photo ? (
                    <img src={patient.photo} alt={patient.name} />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{patient.name}</h3>
                    <Badge variant="outline" className={getStageColor(patient.stage)}>
                      {patient.stage.charAt(0).toUpperCase() + patient.stage.slice(1)} Stage
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      {patient.age} • {patient.gender} • {patient.diagnosis}
                    </div>
                    <div>Last visit: {new Date(patient.last_visit).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No patients found matching your search criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
