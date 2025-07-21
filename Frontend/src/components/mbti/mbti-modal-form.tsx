// src/components/mbti/MbtiModalForm.tsx
import React, { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; 
interface MbtiModalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple questions to derive MBTI dichotomies
const mbtiQuestions = [
  {
    id: "ei",
    question: "When interacting with others, do you usually feel...",
    options: [
      { value: "E", label: "Energized (Extroversion)" },
      { value: "I", label: "Drained (Introversion)" },
    ],
  },
  {
    id: "sn",
    question: "When making decisions, do you focus more on...",
    options: [
      { value: "S", label: "Facts and details (Sensing)" },
      { value: "N", label: "Big picture and possibilities (Intuition)" },
    ],
  },
  {
    id: "tf",
    question: "When evaluating things, do you tend to be more...",
    options: [
      { value: "T", label: "Objective and logical (Thinking)" },
      { value: "F", label: "Empathetic and harmonious (Feeling)" },
    ],
  },
  {
    id: "jp",
    question: "Regarding your daily life, are you generally more...",
    options: [
      { value: "J", label: "Organized and planned (Judging)" },
      { value: "P", label: "Flexible and spontaneous (Perceiving)" },
    ],
  },
];

export function MbtiModalForm({ isOpen, onClose }: MbtiModalFormProps) {
  const { user, updateMbtiTypeInFirestore } = useAuth(); // Get user and the update function
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [manualType, setManualType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAnswers({});
      setManualType("");
    }
  }, [isOpen]);

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateMbtiType = (): string | null => {
    if (
      answers.ei &&
      answers.sn &&
      answers.tf &&
      answers.jp &&
      Object.keys(answers).length === 4 // Ensure all questions answered
    ) {
      return `${answers.ei}${answers.sn}${answers.tf}${answers.jp}`;
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalMbtiType: string | null = null;

    if (manualType) {
      // Validate manual input (basic validation for 4 letters)
      if (/^[EISNTFJPMB]{4}$/i.test(manualType)) {
        finalMbtiType = manualType.toUpperCase();
      } else {
        toast.error("Invalid MBTI type. Please enter 4 letters (e.g., INTJ).");
        setIsSubmitting(false);
        return;
      }
    } else {
      finalMbtiType = calculateMbtiType();
      if (!finalMbtiType) {
        toast.error("Please answer all questions or enter your type manually.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!user?.uid) {
      toast.error("User not authenticated.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateMbtiTypeInFirestore(user.uid, finalMbtiType);
      toast.success(
        finalMbtiType
          ? `Your MBTI type (${finalMbtiType}) has been saved!`
          : "Your MBTI type has been cleared."
      );
      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Failed to save MBTI type:", error);
      toast.error("Failed to save MBTI type. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose(); // Just close the modal, don't save anything
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tell Us About Your Personality</DialogTitle>
          <DialogDescription>
            Help us understand you better by providing your MBTI type. You can
            either answer a few quick questions or enter it manually if you
            already know it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {mbtiQuestions.map((q) => (
            <div key={q.id} className="grid gap-2">
              <Label className="text-sm font-medium">{q.question}</Label>
              <RadioGroup
                onValueChange={(value) => handleRadioChange(q.id, value)}
                value={answers[q.id] || ""}
                className="flex flex-col space-y-1"
                disabled={isSubmitting || !!manualType} // Disable if manually typing
              >
                {q.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${q.id}-${option.value}`}
                    />
                    <Label htmlFor={`${q.id}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manual-mbti">
              Enter Your MBTI Type Manually (e.g., INTJ)
            </Label>
            <Input
              id="manual-mbti"
              placeholder="e.g., ISTP"
              value={manualType}
              onChange={(e) => {
                setManualType(e.target.value);
                setAnswers({}); // Clear radio answers if typing manually
              }}
              className="col-span-3"
              disabled={isSubmitting}
              maxLength={4} // Limit to 4 characters
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save My Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
