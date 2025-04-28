
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, Brain, Moon, Activity, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WellbeingScores {
  sleep: number;
  activity: number;
  mood: number;
  overall: number;
}

interface PatientWellbeingQuestionnaireProps {
  onSubmit: (scores: WellbeingScores) => void;
}

export default function PatientWellbeingQuestionnaire({ onSubmit }: PatientWellbeingQuestionnaireProps) {
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [moodRating, setMoodRating] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const calculateScores = (): WellbeingScores => {
    // Calculate scores based on questionnaire responses
    const sleepScore = sleepQuality ? parseInt(sleepQuality) * 20 : 0;
    const activityScore = activityLevel ? parseInt(activityLevel) * 20 : 0;
    const moodScore = moodRating ? parseInt(moodRating) * 20 : 0;
    
    const overallScore = Math.round((sleepScore + activityScore + moodScore) / 3);
    
    return {
      sleep: sleepScore,
      activity: activityScore,
      mood: moodScore,
      overall: overallScore
    };
  };

  const handleSubmit = () => {
    if (!sleepQuality || !activityLevel || !moodRating) {
      toast({
        title: "Incomplete assessment",
        description: "Please answer all questions to complete the wellbeing assessment.",
        variant: "destructive"
      });
      return;
    }

    const scores = calculateScores();
    onSubmit(scores);
    setIsSubmitted(true);
    
    toast({
      title: "Assessment submitted",
      description: "Thank you for completing the wellbeing assessment.",
    });

    // Reset form after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 2000);
  };

  const resetForm = () => {
    setSleepQuality(null);
    setActivityLevel(null);
    setMoodRating(null);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-memora-purple" />
            Wellbeing Assessment
          </CardTitle>
          {(sleepQuality || activityLevel || moodRating) && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">Assessment Submitted</h3>
            <p className="text-muted-foreground text-center">
              Thank you for completing the wellbeing assessment
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Moon className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Sleep Quality</h3>
              </div>
              <RadioGroup 
                value={sleepQuality || ""} 
                onValueChange={setSleepQuality}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`sleep-${value}`} 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor={`sleep-${value}`}
                      className={`w-full text-center p-2 rounded-md cursor-pointer border ${
                        sleepQuality === value.toString() 
                          ? "bg-blue-100 border-blue-300" 
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {value}
                    </Label>
                    {value === 1 && <span className="text-xs mt-1">Poor</span>}
                    {value === 5 && <span className="text-xs mt-1">Excellent</span>}
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Activity Level</h3>
              </div>
              <RadioGroup 
                value={activityLevel || ""} 
                onValueChange={setActivityLevel}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`activity-${value}`} 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor={`activity-${value}`}
                      className={`w-full text-center p-2 rounded-md cursor-pointer border ${
                        activityLevel === value.toString() 
                          ? "bg-green-100 border-green-300" 
                          : "hover:bg-green-50"
                      }`}
                    >
                      {value}
                    </Label>
                    {value === 1 && <span className="text-xs mt-1">Low</span>}
                    {value === 5 && <span className="text-xs mt-1">High</span>}
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Mood Today</h3>
              </div>
              <RadioGroup 
                value={moodRating || ""} 
                onValueChange={setMoodRating}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`mood-${value}`} 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor={`mood-${value}`}
                      className={`w-full text-center p-2 rounded-md cursor-pointer border ${
                        moodRating === value.toString() 
                          ? "bg-purple-100 border-purple-300" 
                          : "hover:bg-purple-50"
                      }`}
                    >
                      {value}
                    </Label>
                    {value === 1 && <span className="text-xs mt-1">Poor</span>}
                    {value === 5 && <span className="text-xs mt-1">Excellent</span>}
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-memora-purple hover:bg-memora-purple-dark"
              disabled={!sleepQuality || !activityLevel || !moodRating}
            >
              Submit Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
