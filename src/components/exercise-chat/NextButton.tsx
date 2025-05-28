import React from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI button path
import { ArrowRight, CheckCheck } from "lucide-react";

export interface NextButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLastQuestionAnswered: boolean; // True if the current question was the last one AND it has been answered+feedback shown
}

const NextButton: React.FC<NextButtonProps> = ({ onClick, isDisabled, isLastQuestionAnswered }) => {
  return (
    <div className="p-4 text-center">
      <Button onClick={onClick} disabled={isDisabled} variant="outline" className="min-w-[180px]">
        {isLastQuestionAnswered ? (
          <>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Finish Exercise
          </>
        ) : (
          <>
            <ArrowRight className="w-4 h-4 mr-1.5" />
            Next Question
          </>
        )}
      </Button>
    </div>
  );
};

export default NextButton;
