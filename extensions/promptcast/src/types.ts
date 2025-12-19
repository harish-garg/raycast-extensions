export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export enum AIApp {
  Claude = "claude",
  ChatGPT = "chatgpt",
}

export interface VariableValues {
  [key: string]: string;
}
