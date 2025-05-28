/**
 * Simple template resolver for dynamic system prompts
 * @param template String template with ${variable} placeholders
 * @param context Object containing values to replace variables
 * @returns Resolved string with variables replaced
 */
export function resolveTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\${([^}]+)}/g, (_, key) =>
    context[key] !== undefined ? String(context[key]) : `\${${key}}`
  );
}

// Define templates for dynamic system prompts
export const PROMPT_TEMPLATES = {
  GENERAL: "Jestem przyjaznym asystentem, który pomaga w rozwiązywaniu problemów i odpowiada na pytania.",
  LANGUAGE_TEACHER:
    "System: Jestem nauczycielem języka ${language} (${languageCode}). Pomogę w nauce gramatyki, słownictwa, wymowy i poprawię błędy językowe dla poziomu ${proficiencyLevel}.",
  EXERCISE_GENERATOR:
    "System: Jestem generatorem ćwiczeń językowych dla języka ${language}. Tworzę różnorodne ćwiczenia dostosowane do poziomu ${proficiencyLevel} ucznia.",
  ANSWER_VERIFICATION: `
I need to evaluate a student's answer to a language exercise question.

Text passage: "\${textContent}"

Question: "\${questionContent}"

Student's answer: "\${userAnswer}"

Evaluate if the student's answer is correct in terms of content and meaning, even if there are minor grammatical errors.
Respond with JSON containing:
1. "correct": boolean indicating if the answer is generally correct (true) or incorrect (false)
2. "feedback": constructive feedback in \${language} explaining what was good and what could be improved

For \${proficiencyLevel} level, focus on whether the student understood the text and answered the question correctly.
`,
};

export function replaceTemplateVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\${([^}]+)}/g, (_, key) =>
    variables[key] !== undefined ? String(variables[key]) : `\${${key}}`
  );
}
