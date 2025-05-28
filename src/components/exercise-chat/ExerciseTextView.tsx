import React from "react";
import type { TextDTO } from "../../types";

export interface ExerciseTextViewProps {
  text: TextDTO | null;
}

const ExerciseTextView: React.FC<ExerciseTextViewProps> = ({ text }) => {
  if (!text) {
    return <div className="p-4 my-4 border rounded-md bg-gray-50 text-gray-700">Loading text content...</div>;
  }

  return (
    <div className="p-6 my-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">{text.title || "Exercise Text"}</h2>
      {/* Render HTML content safely if applicable, or split by newline for plain text */}
      {/* Assuming text.content is plain text with newlines for paragraphs */}
      <div className="prose max-w-none text-gray-700">
        {text.content.split("\n\n").map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph.split("\n").map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ExerciseTextView;
