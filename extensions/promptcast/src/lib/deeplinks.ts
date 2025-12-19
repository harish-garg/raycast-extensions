import { AIApp } from "../types";

/**
 * Generates a deep link URL for the specified AI application with the given prompt
 * @param app The AI application to generate a link for
 * @param prompt The prompt text to include in the URL
 * @returns The deep link URL
 */
export function generateDeepLink(app: AIApp, prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt);

  switch (app) {
    case AIApp.Claude:
      // Claude.ai uses a query parameter approach
      return `https://claude.ai/new?q=${encodedPrompt}`;

    case AIApp.ChatGPT:
      // ChatGPT uses a query parameter in the URL
      return `https://chatgpt.com/?q=${encodedPrompt}`;

    default:
      throw new Error(`Unsupported AI app: ${app}`);
  }
}

/**
 * Gets the display name for an AI application
 * @param app The AI application
 * @returns The human-readable name
 */
export function getAppDisplayName(app: AIApp): string {
  switch (app) {
    case AIApp.Claude:
      return "Claude";
    case AIApp.ChatGPT:
      return "ChatGPT";
    default:
      return app;
  }
}
