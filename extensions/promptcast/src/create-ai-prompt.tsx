import { Action, ActionPanel, Form, showToast, Toast, popToRoot } from "@raycast/api";
import { useState } from "react";
import { savePrompt } from "./lib/storage";
import { extractVariables } from "./lib/variables";
import { Prompt } from "./types";

export default function CreateAIPrompt() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Title Required",
        message: "Please enter a title for your prompt",
      });
      return;
    }

    if (!content.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Content Required",
        message: "Please enter the prompt content",
      });
      return;
    }

    const now = new Date().toISOString();
    const prompt: Prompt = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await savePrompt(prompt);

      const variables = extractVariables(prompt.content);
      const variableInfo = variables.length > 0 ? ` with ${variables.length} variable(s)` : "";

      await showToast({
        style: Toast.Style.Success,
        title: "Prompt Saved",
        message: `"${prompt.title}" saved${variableInfo}`,
      });

      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Save",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Prompt" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="e.g., Explain Concept Simply"
        value={title}
        onChange={setTitle}
      />

      <Form.TextArea
        id="content"
        title="Prompt"
        placeholder="e.g., Explain {concept} in simple terms for a beginner. Use {language} as examples."
        value={content}
        onChange={setContent}
        enableMarkdown={false}
      />

      <Form.Description text="Use {variableName} for variables that you'll fill in later when launching the prompt." />

      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="e.g., education, programming, explanation"
        value={tags}
        onChange={setTags}
      />

      <Form.Description text="Separate tags with commas. Tags help you organize and find prompts later." />
    </Form>
  );
}
