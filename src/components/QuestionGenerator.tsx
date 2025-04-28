
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HelpCircle, RefreshCw, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type QuestionCategory = "cognitive" | "daily" | "medical" | "emotional" | "custom";

interface QuestionTemplate {
  category: QuestionCategory;
  questions: string[];
}

const questionTemplates: QuestionTemplate[] = [
  {
    category: "cognitive",
    questions: [
      "Can you recall what you had for breakfast today?",
      "What day of the week is it today?",
      "Can you name three objects that I just showed you?",
      "How would you describe your current location?",
      "Can you count backward from 100 by 7s?",
      "Can you tell me who the current president is?",
      "Can you draw a clock showing 3:45?",
      "Can you remember three words I mentioned five minutes ago?",
    ]
  },
  {
    category: "daily",
    questions: [
      "How did you sleep last night?",
      "Are you having any difficulty with daily activities like dressing or bathing?",
      "Did you take your medications today?",
      "Are you able to prepare simple meals for yourself?",
      "Do you remember where important items like keys or wallet are kept?",
      "How are you managing with household chores?",
      "Have you been able to maintain your hobbies or interests?",
      "Are you comfortable going outside alone?",
    ]
  },
  {
    category: "medical",
    questions: [
      "Have you noticed any new symptoms lately?",
      "Are you experiencing any side effects from your medications?",
      "Have you had any falls or accidents recently?",
      "Are you having any pain or discomfort?",
      "How is your appetite and eating?",
      "Have you noticed any changes in your vision or hearing?",
      "Are you experiencing any changes in bowel or bladder habits?",
      "Have you felt unusually tired or had changes in your energy level?",
    ]
  },
  {
    category: "emotional",
    questions: [
      "How would you describe your mood today?",
      "Have you been feeling anxious or worried lately?",
      "Are you enjoying activities that you used to enjoy?",
      "Do you sometimes feel confused or overwhelmed?",
      "How do you feel about your memory changes?",
      "Are you feeling supported by family and friends?",
      "Have you felt lonely or isolated recently?",
      "Do you have concerns about the future?",
    ]
  }
];

export default function QuestionGenerator() {
  const [category, setCategory] = useState<QuestionCategory>("cognitive");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    setLoading(true);
    
    // In a real app, this would call an AI API
    setTimeout(() => {
      if (category === "custom" && customPrompt) {
        // Generate questions based on custom prompt
        const customQuestions = [
          `Based on "${customPrompt}": How often does this occur?`,
          `Based on "${customPrompt}": When did you first notice this?`,
          `Based on "${customPrompt}": How does this affect daily activities?`,
          `Based on "${customPrompt}": What makes this better or worse?`,
          `Based on "${customPrompt}": Have you discussed this with a doctor?`,
        ];
        setGeneratedQuestions(customQuestions);
      } else {
        // Use template questions
        const template = questionTemplates.find(t => t.category === category);
        if (template) {
          setGeneratedQuestions(template.questions);
        }
      }
      setLoading(false);
    }, 1500);
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
          Question Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Question Category</Label>
            <RadioGroup 
              value={category} 
              onValueChange={(value) => setCategory(value as QuestionCategory)}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cognitive" id="cognitive" />
                <Label htmlFor="cognitive">Cognitive Assessment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily Functioning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medical" id="medical" />
                <Label htmlFor="medical">Medical Symptoms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emotional" id="emotional" />
                <Label htmlFor="emotional">Emotional Wellbeing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom Questions</Label>
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
                placeholder="Enter a topic, symptom, or behavior you'd like to ask about..."
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
                    className="flex items-center justify-between bg-white/70 p-3 rounded-md"
                  >
                    <p className="text-sm flex-1">{question}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyQuestion(question)}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
