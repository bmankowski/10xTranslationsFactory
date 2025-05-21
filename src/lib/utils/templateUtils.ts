/**
 * Simple template resolver for dynamic system prompts
 * @param template String template with ${variable} placeholders
 * @param context Object containing values to replace variables
 * @returns Resolved string with variables replaced
 */
export function resolveTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\${([^}]+)}/g, (_, key) => 
    context[key] !== undefined ? context[key] : `\${${key}}`
  );
} 