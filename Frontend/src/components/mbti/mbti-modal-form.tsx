import{ useState, useEffect, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; 
interface MbtiModalFormProps {
  isOpen: boolean;
  onClose: () => void;
}



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
            either answer a few quick questions <a target="_blank" href="https://www.16personalities.com/free-personality-test" className="italic underline cursor-pointer text-blue-300">here</a> or enter it manually if you
            already know it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative flex py-4 items-center">
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
