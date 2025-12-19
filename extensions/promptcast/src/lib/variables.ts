import { VariableValues } from "../types";

/**
 * Extracts all variables from a prompt string
 * Variables are defined as {variableName}
 * @param prompt The prompt string to parse
 * @returns Array of unique variable names
 */
export function extractVariables(prompt: string): string[] {
  const variableRegex = /\{([^}]+)\}/g;
  const matches = prompt.matchAll(variableRegex);
  const variables = Array.from(matches, (match) => match[1]);

  // Return unique variables only
  return [...new Set(variables)];
}

/**
 * Replaces variables in a prompt with their values
 * @param prompt The prompt string with variables
 * @param values Object mapping variable names to their values
 * @returns The prompt with variables replaced
 */
export function replaceVariables(prompt: string, values: VariableValues): string {
  let result = prompt;

  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Checks if a prompt contains any variables
 * @param prompt The prompt string to check
 * @returns true if the prompt contains variables
 */
export function hasVariables(prompt: string): boolean {
  return /\{[^}]+\}/.test(prompt);
}
