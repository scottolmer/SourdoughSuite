import { useState } from "react";
import { useLocation } from "wouter";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Clock, 
  Flame, 
  Loader2, 
  Thermometer,
  Wheat,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// Define quiz question types
interface QuizQuestion {
  id: string;
  question: string;
  description?: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
  }>;
}

export function StarterQuizPage() {
  const [_, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock quiz questions
  const questions: QuizQuestion[] = [
    {
      id: "baking-frequency",
      question: "How often do you plan to bake?",
      description: "This helps determine how active your starter needs to be",
      options: [
        { 
          id: "daily", 
          label: "Daily", 
          description: "I'll bake almost every day",
          icon: Flame
        },
        { 
          id: "weekly", 
          label: "Weekly", 
          description: "I'll bake 1-2 times per week",
          icon: Clock
        },
        { 
          id: "monthly", 
          label: "Monthly", 
          description: "I'll bake occasionally",
          icon: Clock
        }
      ]
    },
    {
      id: "climate",
      question: "What's your typical home temperature?",
      description: "Different starters thrive in different temperature ranges",
      options: [
        { 
          id: "cool", 
          label: "Cool", 
          description: "Under 68°F (20°C)",
          icon: Thermometer
        },
        { 
          id: "moderate", 
          label: "Moderate", 
          description: "68-75°F (20-24°C)",
          icon: Thermometer
        },
        { 
          id: "warm", 
          label: "Warm", 
          description: "Above 75°F (24°C)",
          icon: Thermometer
        }
      ]
    },
    {
      id: "flavor-preference",
      question: "What flavor profile do you prefer?",
      description: "Sourdough starters can develop different flavor characteristics",
      options: [
        { 
          id: "mild", 
          label: "Mild & Sweet", 
          description: "Subtle tanginess, more wheat flavor"
        },
        { 
          id: "balanced", 
          label: "Balanced", 
          description: "Classic sourdough taste"
        },
        { 
          id: "sour", 
          label: "Very Tangy", 
          description: "Pronounced sour flavor"
        }
      ]
    },
    {
      id: "flour-preference",
      question: "What type of flour do you prefer working with?",
      description: "Different starters work best with different flours",
      options: [
        { 
          id: "white", 
          label: "White Flour", 
          description: "All-purpose or bread flour",
          icon: Wheat
        },
        { 
          id: "whole-wheat", 
          label: "Whole Wheat", 
          description: "Whole grain wheat flour",
          icon: Wheat
        },
        { 
          id: "specialty", 
          label: "Specialty Grains", 
          description: "Rye, spelt, einkorn, etc.",
          icon: Wheat
        }
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectOption = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };

  const handleNextQuestion = () => {
    // Scroll to top when moving to next question
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit answers
      setIsSubmitting(true);
      
      // Simulate API call to n8n workflow
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/starter/recommendation");
      }, 2000);
    }
  };

  const handlePreviousQuestion = () => {
    // Scroll to top when moving to previous question
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isCurrentQuestionAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <MobileLayout title="Starter Quiz" showBackButton>
      <div className="space-y-6">
        <Progress value={progress} className="h-1.5" />
        
        <div className="text-xs text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        
        <section className="space-y-2">
          <h1 className="text-xl font-semibold">{currentQuestion.question}</h1>
          {currentQuestion.description && (
            <p className="text-muted-foreground text-sm">{currentQuestion.description}</p>
          )}
        </section>

        <RadioGroup 
          value={answers[currentQuestion.id]} 
          onValueChange={handleSelectOption}
          className="space-y-3"
        >
          {currentQuestion.options.map(option => (
            <div key={option.id} className="flex items-start space-x-2">
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                className="mt-1"
              />
              <Label 
                htmlFor={option.id}
                className="flex-1 cursor-pointer rounded-lg border border-border p-3 hover:bg-accent"
              >
                <div className="flex gap-3">
                  {option.icon && (
                    <div className="rounded-md bg-primary/10 p-2 h-10 w-10 flex items-center justify-center">
                      <option.icon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNextQuestion}
            disabled={!isCurrentQuestionAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Match...
              </>
            ) : isLastQuestion ? (
              "See Results"
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}