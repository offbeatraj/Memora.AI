
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HelpCircle, RefreshCw, Copy, Loader2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type PatientQuestionCategory = 
  | "cognitive" 
  | "daily" 
  | "medical" 
  | "emotional" 
  | "custom" 
  | "case-specific"
  | "caregiving-strategies";

interface PatientQuestionGeneratorProps {
  patientName: string;
  patientStage: string;
  caseStudy: string;
  onSelectQuestion: (question: string) => void;
}

export default function PatientQuestionGenerator({ 
  patientName, 
  patientStage,
  caseStudy,
  onSelectQuestion 
}: PatientQuestionGeneratorProps) {
  const [category, setCategory] = useState<PatientQuestionCategory>("case-specific");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate questions when component mounts or when patient details change
  useEffect(() => {
    generateQuestionsForCategory("case-specific");
  }, [patientName, patientStage, caseStudy]);

  const handleGenerate = () => {
    generateQuestionsForCategory(category);
  };

  const extractCareScenarios = (caseStudy: string): string[] => {
    // Look for key phrases that might indicate care scenarios
    const scenarios = [];
    
    if (caseStudy.toLowerCase().includes('night') && 
        (caseStudy.toLowerCase().includes('sleep') || 
         caseStudy.toLowerCase().includes('bed') || 
         caseStudy.toLowerCase().includes('awake'))) {
      scenarios.push('nighttime issues');
    }
    
    if (caseStudy.toLowerCase().includes('confus') || 
        caseStudy.toLowerCase().includes('forget') || 
        caseStudy.toLowerCase().includes('memory')) {
      scenarios.push('confusion or disorientation');
    }
    
    if (caseStudy.toLowerCase().includes('meal') || 
        caseStudy.toLowerCase().includes('eat') || 
        caseStudy.toLowerCase().includes('food')) {
      scenarios.push('eating difficulties');
    }
    
    if (caseStudy.toLowerCase().includes('bath') || 
        caseStudy.toLowerCase().includes('shower') || 
        caseStudy.toLowerCase().includes('hygiene')) {
      scenarios.push('personal hygiene');
    }
    
    if (caseStudy.toLowerCase().includes('agitat') || 
        caseStudy.toLowerCase().includes('angry') || 
        caseStudy.toLowerCase().includes('upset')) {
      scenarios.push('agitation');
    }
    
    // If we can't identify specific scenarios, return a generic scenario
    return scenarios.length > 0 ? scenarios : ['care challenges'];
  };

  const generateQuestionsForCategory = (questionCategory: PatientQuestionCategory) => {
    setLoading(true);
    
    // Extract care scenarios from case study if available
    const careScenarios = caseStudy ? extractCareScenarios(caseStudy) : ['care challenges'];
    
    // In a real app, this would use AI to generate questions based on the case study
    setTimeout(() => {
      let questions: string[] = [];
      
      if (questionCategory === "case-specific") {
        // Generate questions based on case study
        if (caseStudy.toLowerCase().includes('night') && 
            (caseStudy.toLowerCase().includes('work') || 
             caseStudy.toLowerCase().includes('getting ready'))) {
          questions = [
            `What would you, as ${patientName}'s caregiver, say to minimize distress when they wake up at night thinking they need to go to work?`,
            `What environmental cues could help reorient ${patientName} during nighttime confusion episodes?`,
            `How should I respond to ${patientName} when they insist on going to work in the middle of the night?`,
            `What validation techniques would work best for ${patientName}'s confusion about needing to go to work?`,
            `Should I explicitly tell ${patientName} they're retired when they're preparing for work at night?`
          ];
        } else {
          questions = [
            `What is the best approach to help ${patientName} with daily activities?`,
            `How can we improve ${patientName}'s sleep quality based on the symptoms described?`,
            `What techniques could help manage ${patientName}'s anxiety mentioned in the case study?`,
            `How should we address ${patientName}'s difficulty with taking medication?`,
            `What memory aids would be most helpful for ${patientName}?`
          ];
        }
      } else if (questionCategory === "caregiving-strategies") {
        // Generate strategy comparison questions
        questions = [
          `What would be a person-centered approach to help ${patientName} during episodes of ${careScenarios[0]}?`,
          `Compare validation therapy versus reality orientation for ${patientName} when dealing with ${careScenarios.length > 1 ? careScenarios[1] : careScenarios[0]}.`,
          `What redirection techniques might work well for ${patientName} during periods of agitation?`,
          `How can I balance honesty and compassion when ${patientName} asks questions about their condition?`,
          `What's the best way to respond when ${patientName} asks repetitive questions or becomes fixated on a topic?`
        ];
      } else if (questionCategory === "cognitive") {
        questions = [
          `What cognitive exercises are most appropriate for ${patientName} at the ${patientStage} stage?`,
          `How can we track ${patientName}'s cognitive changes over time?`,
          `What memory techniques might help ${patientName} with daily tasks?`,
          `How should family members respond when ${patientName} is confused about time or place?`,
          `What signs of cognitive change should we monitor in ${patientName}?`
        ];
      } else if (questionCategory === "daily") {
        questions = [
          `What daily routine would work best for ${patientName}?`,
          `How can we make ${patientName}'s home safer and more navigable?`,
          `What level of assistance does ${patientName} need with personal hygiene at this stage?`,
          `How can we help ${patientName} maintain independence with meals?`,
          `What activities can ${patientName} still enjoy independently?`
        ];
      } else if (questionCategory === "medical") {
        questions = [
          `What medications are typically prescribed for patients like ${patientName}?`,
          `How should we monitor ${patientName} for medication side effects?`,
          `What symptoms should prompt an immediate call to ${patientName}'s doctor?`,
          `How often should ${patientName} have follow-up medical appointments?`,
          `What complementary therapies might benefit ${patientName}?`
        ];
      } else if (questionCategory === "emotional") {
        questions = [
          `How can family members best support ${patientName}'s emotional wellbeing?`,
          `What might be causing ${patientName}'s recent anxiety or agitation?`,
          `How can we help ${patientName} cope with awareness of memory loss?`,
          `What social activities would be appropriate for ${patientName} at this stage?`,
          `How can we recognize depression in ${patientName}?`
        ];
      } else if (questionCategory === "custom" && customPrompt) {
        // Generate questions based on custom prompt
        questions = [
          `Regarding "${customPrompt}": How does this affect ${patientName} specifically?`,
          `Regarding "${customPrompt}": What approaches would work for ${patientName} at the ${patientStage} stage?`,
          `Regarding "${customPrompt}": How might this change as ${patientName}'s condition progresses?`,
          `Regarding "${customPrompt}": What resources could help ${patientName} and caregivers?`,
          `Regarding "${customPrompt}": How should we monitor this aspect of ${patientName}'s care?`,
        ];
      }
      
      setGeneratedQuestions(questions);
      setLoading(false);
    }, 1000);
  };

  const handleCopyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast({
      title: "Question copied",
      description: "The question has been copied to your clipboard.",
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-memora-purple" />
          Questions for {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Question Category</Label>
            <RadioGroup 
              value={category} 
              onValueChange={(value) => setCategory(value as PatientQuestionCategory)}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="case-specific" id="case-specific" />
                <Label htmlFor="case-specific">Case Specific</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="caregiving-strategies" id="caregiving-strategies" />
                <Label htmlFor="caregiving-strategies">Care Strategies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cognitive" id="cognitive" />
                <Label htmlFor="cognitive">Cognitive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily Care</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medical" id="medical" />
                <Label htmlFor="medical">Medical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emotional" id="emotional" />
                <Label htmlFor="emotional">Emotional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom</Label>
              </div>
            </RadioGroup>
          </div>

          {category === "custom" && (
            <div>
              <Label htmlFor="custom-prompt" className="mb-2 block">
                Custom Topic or Concern
              </Label>
              <Textarea
                id="custom-prompt"
                placeholder={`Enter a specific topic or concern about ${patientName}...`}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="bg-white/70"
                rows={3}
              />
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            className="w-full bg-memora-purple hover:bg-memora-purple-dark"
            disabled={loading || (category === "custom" && !customPrompt)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>

          {generatedQuestions.length > 0 && (
            <div className="mt-6">
              <Label className="mb-2 block">Generated Questions</Label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {generatedQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/70 p-3 rounded-md hover:bg-white transition-colors"
                  >
                    <p className="text-sm flex-1">{question}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyQuestion(question)}
                        className="flex-shrink-0"
                        title="Copy question"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectQuestion(question)}
                        className="flex-shrink-0 text-memora-purple"
                        title="Use this question"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
