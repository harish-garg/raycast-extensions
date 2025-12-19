import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { savePrompt } from "../lib/storage";
import { extractVariables } from "../lib/variables";
import { Prompt } from "../types";

interface EditPromptFormProps {
  prompt: Prompt;
  onEdit: () => void;
}

export default function EditPromptForm({ prompt, onEdit }: EditPromptFormProps) {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [tags, setTags] = useState(prompt.tags.join(", "));
  const { pop } = useNavigation();

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

    const updatedPrompt: Prompt = {
      ...prompt,
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      updatedAt: new Date().toISOString(),
    };

    try {
      await savePrompt(updatedPrompt);

      const variables = extractVariables(updatedPrompt.content);
      const variableInfo = variables.length > 0 ? ` with ${variables.length} variable(s)` : "";

      await showToast({
        style: Toast.Style.Success,
        title: "Prompt Updated",
        message: `"${updatedPrompt.title}" saved${variableInfo}`,
      });

      onEdit();
      pop();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Update",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Prompt" onSubmit={handleSubmit} />
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
