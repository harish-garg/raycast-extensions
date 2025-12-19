import { Action, ActionPanel, Form, showToast, Toast, open, popToRoot } from "@raycast/api";
import { useState } from "react";
import { hasVariables } from "../lib/variables";
import { generateDeepLink, getAppDisplayName } from "../lib/deeplinks";
import { Prompt, AIApp } from "../types";
import VariableInputForm from "./VariableInputForm";

interface AppSelectionFormProps {
  prompt: Prompt;
}

export default function AppSelectionForm({ prompt }: AppSelectionFormProps) {
  const [selectedApps, setSelectedApps] = useState<string[]>([AIApp.Claude]);

  const handleSubmit = async () => {
    if (selectedApps.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Apps Selected",
        message: "Please select at least one AI application",
      });
      return;
    }

    const apps = selectedApps as AIApp[];

    // If the prompt has variables, show the variable input form
    if (hasVariables(prompt.content)) {
      // This will be handled by pushing VariableInputForm
      return;
    }

    // No variables - launch directly
    try {
      for (const app of apps) {
        const url = generateDeepLink(app, prompt.content);
        await open(url);
      }

      const appNames = apps.map(getAppDisplayName).join(", ");
      await showToast({
        style: Toast.Style.Success,
        title: "Launched Successfully",
        message: `"${prompt.title}" opened in ${appNames}`,
      });

      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Launch",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const promptHasVariables = hasVariables(prompt.content);
  const apps = selectedApps as AIApp[];

  return (
    <Form
      navigationTitle={`Launch: ${prompt.title}`}
      actions={
        <ActionPanel>
          {promptHasVariables ? (
            <Action.Push
              title="Next: Fill Variables"
              target={<VariableInputForm prompt={prompt} selectedApps={apps} />}
            />
          ) : (
            <Action.SubmitForm title="Launch to Apps" onSubmit={handleSubmit} />
          )}
        </ActionPanel>
      }
    >
      <Form.Description text="Select which AI applications you want to launch this prompt to:" />

      <Form.Checkbox
        id="claude"
        label="Claude"
        value={selectedApps.includes(AIApp.Claude)}
        onChange={(checked) => {
          if (checked) {
            setSelectedApps([...selectedApps, AIApp.Claude]);
          } else {
            setSelectedApps(selectedApps.filter((app) => app !== AIApp.Claude));
          }
        }}
      />

      <Form.Checkbox
        id="chatgpt"
        label="ChatGPT"
        value={selectedApps.includes(AIApp.ChatGPT)}
        onChange={(checked) => {
          if (checked) {
            setSelectedApps([...selectedApps, AIApp.ChatGPT]);
          } else {
            setSelectedApps(selectedApps.filter((app) => app !== AIApp.ChatGPT));
          }
        }}
      />

      {promptHasVariables && (
        <>
          <Form.Separator />
          <Form.Description text="This prompt contains variables. You'll be asked to fill them in on the next screen." />
        </>
      )}
    </Form>
  );
}
