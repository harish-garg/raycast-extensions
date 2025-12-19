import { LocalStorage } from "@raycast/api";
import { Prompt } from "../types";

const PROMPTS_KEY = "prompts";

export async function getAllPrompts(): Promise<Prompt[]> {
  const data = await LocalStorage.getItem<string>(PROMPTS_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse prompts:", error);
    return [];
  }
}

export async function savePrompt(prompt: Prompt): Promise<void> {
  const prompts = await getAllPrompts();
  const existingIndex = prompts.findIndex((p) => p.id === prompt.id);

  if (existingIndex >= 0) {
    prompts[existingIndex] = {
      ...prompt,
      updatedAt: new Date().toISOString(),
    };
  } else {
    prompts.push(prompt);
  }

  await LocalStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

export async function deletePrompt(id: string): Promise<void> {
  const prompts = await getAllPrompts();
  const filtered = prompts.filter((p) => p.id !== id);
  await LocalStorage.setItem(PROMPTS_KEY, JSON.stringify(filtered));
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
  const prompts = await getAllPrompts();
  return prompts.find((p) => p.id === id);
}
