
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { savePatientConversation } from "@/integrations/supabase/client";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample case scenario
const sampleCaseData = {
  title: "Nighttime Confusion Case Scenario",
  content: `Pam is a 73-year-old woman who lives at home with her daughter Laurel, age 40. Pam was diagnosed with Alzheimer's disease by her GP when she was 68. Pam's Alzheimer's disease has gradually affected her memory and ability to do daily tasks. When Laurel is at work, a home health aide assists Pam with various tasks. For the past couple of years, Pam has relied on Laurel to remind her and prompt her for many things.

One night, Laurel is awakened at 2 a.m. by her mother Pam anxiously getting ready for work (even though she retired 7 years ago). Laurel goes to her mother to talk with her and try to get her to go back to bed.`,
  strategies: [
    {
      name: "Reality Orientation",
      description: "Directly correcting the person's misconceptions",
      example: "Mom, you're retired and need to go back to sleep. It's the middle of the night.",
      recommended: false
    },
    {
      name: "Validation and Redirection",
      description: "Acknowledging feelings and gently redirecting focus",
      example: "I see you're getting ready. It's still nighttime though. Let's have some tea and rest until morning.",
      recommended: true
    },
    {
      name: "Environmental Cues",
      description: "Using the environment to provide orientation",
      example: "Let me open the curtains so you can see it's dark outside. We still have time to sleep.",
      recommended: true
    }
  ]
};

interface MockCaseFileProps {
  patientId?: string;
  onLoadCase?: (caseData: any) => void;
}

export default function MockCaseFile({ patientId, onLoadCase }: MockCaseFileProps) {
  const [loadedCase, setLoadedCase] = useState(false);
  const navigate = useNavigate();

  const handleLoadCase = async () => {
    try {
      // Create a case file in local storage
      if (patientId) {
        await savePatientConversation(
          patientId,
          sampleCaseData.content,
          "Case Scenario: " + sampleCaseData.title
        );
        
        // If we have a function to notify parent components, call it
        if (onLoadCase) {
          onLoadCase(sampleCaseData);
        }
        
        setLoadedCase(true);
      }
    } catch (error) {
      console.error("Error loading mock case:", error);
    }
  };

  const goToCreateCase = () => {
    // Navigate to upload page with patient ID
    if (patientId) {
      navigate(`/upload/${patientId}`);
    } else {
      navigate('/upload');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Example Case Scenario</span>
          <div className="flex gap-2">
            <Button
              onClick={goToCreateCase}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Create Custom Case
            </Button>
            {!loadedCase && patientId && (
              <Button 
                onClick={handleLoadCase} 
                size="sm" 
                className="bg-memora-purple hover:bg-memora-purple-dark"
              >
                <FileText className="mr-2 h-4 w-4" /> Load Example
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white/70 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{sampleCaseData.title}</h3>
            <p className="text-sm whitespace-pre-wrap">{sampleCaseData.content}</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Care Strategies:</h3>
            {sampleCaseData.strategies.map((strategy, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${strategy.recommended ? 'bg-green-50 border border-green-200' : 'bg-white/70'}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{strategy.name}</h4>
                  {strategy.recommended && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                  <span className="font-medium">Example: </span>
                  "{strategy.example}"
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <h3 className="font-medium text-amber-800">Try asking the AI:</h3>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              <li>"What would you, as Laurel, her daughter and caregiver, say to Pam to minimize the level of distress and get her to return to bed?"</li>
              <li>"How should I respond to nighttime confusion about work?"</li>
              <li>"What's the best approach when my mother with Alzheimer's thinks she needs to go to work?"</li>
            </ul>
          </div>
          
          {loadedCase && (
            <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
              Case scenario has been loaded! Try asking the patient assistant questions about it.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
