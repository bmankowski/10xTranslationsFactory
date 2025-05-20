import { supabase } from '../../db/supabase';
import { generateAIFeedback } from './openAIService';

/**
 * Evaluates user's answer and provides feedback
 * @param questionId The ID of the question
 * @param userAnswer The answer provided by the user
 * @returns Object with correctness assessment and feedback
 */
export async function generateFeedback(questionId: string, userAnswer: string): Promise<{ isCorrect: boolean, feedback: string }> {
  try {
    // Fetch the question and associated text
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select(`
        *,
        text:text_id(
          content,
          language:language_id(name, code),
          proficiency_level:proficiency_level_id(name)
        )
      `)
      .eq('id', questionId)
      .single();

    if (questionError || !questionData) {
      console.error("Error fetching question data:", questionError);
      return {
        isCorrect: false,
        feedback: "Could not evaluate answer due to technical issues."
      };
    }

    // Use AI to evaluate the response and generate feedback
    const evaluationResult = await generateAIFeedback({
      questionContent: questionData.content,
      textContent: questionData.text.content,
      userAnswer,
      language: questionData.text.language?.name || 'English',
      languageCode: questionData.text.language?.code || 'en',
      proficiencyLevel: questionData.text.proficiency_level?.name || 'Intermediate'
    });
    
    // If AI evaluation fails, fall back to a basic evaluation
    if (!evaluationResult) {
      // Basic fallback evaluation (very simplistic)
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      const questionLower = questionData.content.toLowerCase();
      const textLower = questionData.text.content.toLowerCase();
      
      // Check if the answer contains keywords from the text
      const relevantWords = extractKeywords(textLower, questionLower);
      const foundKeywords = relevantWords.filter(word => normalizedUserAnswer.includes(word));
      const isCorrect = foundKeywords.length >= Math.ceil(relevantWords.length / 3);
      
      return {
        isCorrect,
        feedback: isCorrect 
          ? "Your answer contains relevant information from the text. Good job!"
          : "Try to include more specific details from the text in your answer."
      };
    }
    
    return evaluationResult;
  } catch (error) {
    console.error("Error in generateFeedback:", error);
    return {
      isCorrect: false,
      feedback: "An error occurred while evaluating your answer. Please try again later."
    };
  }
}

/**
 * Simple helper function to extract potential keywords from text based on the question
 */
function extractKeywords(text: string, question: string): string[] {
  // Remove common words and punctuation
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);
  
  // Split text into words
  const allWords = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(/\s+/);
  
  // Filter out common words and single-character words
  const significantWords = allWords.filter(word => !commonWords.has(word) && word.length > 3);
  
  // Get unique words
  const uniqueWords = Array.from(new Set(significantWords));
  
  // Find words that appear in question
  const questionWords = question.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(/\s+/);
  
  // Prioritize words that also appear in the question
  const relevantWords = uniqueWords.filter(word => questionWords.includes(word));
  
  // Add some other significant words if we don't have enough relevant words
  if (relevantWords.length < 5) {
    const additionalWords = uniqueWords
      .filter(word => !relevantWords.includes(word))
      .slice(0, 5 - relevantWords.length);
    
    relevantWords.push(...additionalWords);
  }
  
  return relevantWords;
} 