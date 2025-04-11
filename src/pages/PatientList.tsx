
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PatientManager from "@/components/PatientManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function PatientList() {
  const [patientStats, setPatientStats] = useState({
    total: 0,
    newThisWeek: 0
  });
  
  useEffect(() => {
    async function fetchPatientStats() {
      try {
        // Get total patient count
        const { count: totalCount, error: totalError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get new patients this week (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: newCount, error: newError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());
        
        if (newError) throw newError;
        
        setPatientStats({
          total: totalCount || 0,
          newThisWeek: newCount || 0
        });
      } catch (error) {
        console.error('Error fetching patient stats:', error);
      }
    }
    
    fetchPatientStats();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Patient Management</h1>
          <p className="text-muted-foreground">
            Access and manage patient records, care plans, and documents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PatientManager />
          </div>
          
          <div>
            <Card className="glass-card mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-memora-purple" />
                  Patient Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/70 p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                      <p className="text-2xl font-bold text-memora-purple">{patientStats.total}</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">New This Week</p>
                      <p className="text-2xl font-bold text-blue-600">{patientStats.newThisWeek}</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Appointments</p>
                      <p className="text-2xl font-bold text-green-600">3</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Care Plans</p>
                      <p className="text-2xl font-bold text-amber-600">5</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-memora-purple" />
                  Care Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Medication Review</p>
                    <p className="text-xs text-red-700 mt-1">Margaret Thompson is due for medication review</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">Assessment Due</p>
                    <p className="text-xs text-amber-700 mt-1">Robert Wilson's cognitive assessment is due this week</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Care Plan Update</p>
                    <p className="text-xs text-blue-700 mt-1">James Martinez's care plan needs updating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
