
import Layout from "@/components/Layout";
import PatientForm from "@/components/PatientForm";

export default function PatientNew() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">New Patient</h1>
          <p className="text-muted-foreground">
            Add a new patient to your management system.
          </p>
        </div>
        
        <PatientForm />
      </div>
    </Layout>
  );
}
