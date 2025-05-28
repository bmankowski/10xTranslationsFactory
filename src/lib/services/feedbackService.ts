import { getAnswerVerificationService } from "../openrouter";
import { resolveTemplate, PROMPT_TEMPLATES } from "../utils/templateUtils";
import { supabase } from "../../db/supabase";
import type { AnswerVerificationResponse } from "./openRouterTypes";

/**
 * Evaluates user's answer and provides feedback
 * @param questionId The ID of the question
 * @param userAnswer The answer provided by the user
 * @returns Object with correctness assessment and feedback
 */
export async function generateFeedback(questionId: string, userAnswer: string): Promise<AnswerVerificationResponse> {
  try {
    // Get question and related text from database
    const { data, error } = await supabase.from("questions").select("*, text:text_id(*)").eq("id", questionId).single();

    if (error) throw error;

    const questionContent = data.content;
    const textContent = data.text.content;
    const language = data.text.language || "English";
    const languageCode = data.text.language_code || "pl";
    const proficiencyLevel = data.text.proficiency_level || "A1";

    // Create dynamic system prompt using template
    const systemPrompt = resolveTemplate(PROMPT_TEMPLATES.LANGUAGE_TEACHER, {
      language,
      languageCode,
      proficiencyLevel,
    });

    // Get answer verification service
    const openRouter = getAnswerVerificationService();

    // Create prompt for AI
    const prompt = `
I need to evaluate a student's answer to a language exercise question.

Text passage: "${textContent.substring(0, 500)}${textContent.length > 500 ? "..." : ""}"

Question: "${questionContent}"

Student's answer: "${userAnswer}"

Evaluate if the student's answer is correct in terms of content and meaning, even if there are minor grammatical errors.
Respond with JSON containing:
1. "correct": boolean indicating if the answer is generally correct (true) or incorrect (false)
2. "feedback": constructive feedback in ${language} explaining what was good and what could be improved

For ${proficiencyLevel} level, focus on whether the student understood the text and answered the question correctly.
`;

    // Send to OpenRouter API with the dynamic system message
    const result = await openRouter.sendMessage(prompt, systemPrompt);

    // Return formatted result
    return {
      correct: result.correct,
      feedback: result.feedback,
    };
  } catch (error) {
    // Implement fallback logic or return default response
    return {
      correct: false,
      feedback: `Sorry, we could not evaluate your answer at this time. ${String(error)}`,
    };
  }
}
