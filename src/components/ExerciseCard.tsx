import React, { useState } from "react";
import { format } from "date-fns";
import type { TextDTO } from "@/types";

interface ExerciseCardProps {
  text: TextDTO;
  isOwner: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ text, isOwner }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/exercises/${text.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to exercises page after successful deletion
        window.location.href = "/exercises";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete exercise");
      }
    } catch {
      alert("Failed to delete exercise");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-shadow">
      <a href={`/exercises/${text.id}`} className="hover:text-blue-200">
        <h3 className="font-medium text-lg mb-2 text-white">{text.title}</h3>
      </a>
      <div className="text-sm text-gray-200 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-indigo-500/30 text-indigo-100 rounded-full text-xs">
            {text.language?.name ?? "Unknown"}
          </span>
          <span className="px-2 py-1 bg-purple-500/30 text-purple-100 rounded-full text-xs">
            {text.visibility === "public" ? "Public" : "Private"}
          </span>
        </div>
        <div className="text-gray-300">Created: {format(new Date(text.created_at), "MMMM d, yyyy")}</div>
      </div>
      <div className="flex space-x-2">
        <a
          href={`/exercises/${text.id}/attempt`}
          className="px-3 py-1 bg-white text-indigo-900 rounded hover:bg-gray-100 text-sm"
        >
          Take Exercise
        </a>
        {isOwner && (
          <form onSubmit={handleDelete} className="inline">
            <button
              type="submit"
              disabled={isDeleting}
              className="px-3 py-1 bg-red-500/30 text-red-100 rounded hover:bg-red-500/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
