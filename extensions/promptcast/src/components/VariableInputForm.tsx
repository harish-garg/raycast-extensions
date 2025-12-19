import { Action, ActionPanel, Form, showToast, Toast, open, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";
import { extractVariables, replaceVariables } from "../lib/variables";
import { generateDeepLink, getAppDisplayName } from "../lib/deeplinks";
import { Prompt, AIApp, VariableValues } from "../types";

interface VariableInputFormProps {
  prompt: Prompt;
  selectedApps: AIApp[];
}

export default function VariableInputForm({ prompt, selectedApps }: VariableInputFormProps) {
  const variables = extractVariables(prompt.content);
  const [variableValues, setVariableValues] = useState<VariableValues>({});

  // Initialize empty values for all variables
  useEffect(() => {
    const initialValues: VariableValues = {};
    variables.forEach((variable) => {
      initialValues[variable] = "";
    });
    setVariableValues(initialValues);
  }, []);

  const handleValueChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate all variables are filled
    const missingVariables = variables.filter((variable) => !variableValues[variable]?.trim());

    if (missingVariables.length > 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Missing Variables",
        message: `Please fill in: ${missingVariables.join(", ")}`,
      });
      return;
    }

    try {
      const filledPrompt = replaceVariables(prompt.content, variableValues);

      // Launch to all selected apps
      for (const app of selectedApps) {
        const url = generateDeepLink(app, filledPrompt);
        await open(url);
      }

      const appNames = selectedApps.map(getAppDisplayName).join(", ");
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

  return (
    <Form
      navigationTitle={`Fill Variables: ${prompt.title}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Launch to Apps" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description
        text={`Fill in the variables below to complete your prompt before launching to ${selectedApps.map(getAppDisplayName).join(", ")}.`}
      />

      {variables.map((variable) => (
        <Form.TextField
          key={variable}
          id={variable}
          title={variable}
          placeholder={`Enter value for {${variable}}`}
          value={variableValues[variable] || ""}
          onChange={(value) => handleValueChange(variable, value)}
        />
      ))}

      <Form.Separator />

      <Form.Description
        title="Preview"
        text={
          Object.keys(variableValues).length > 0 ? replaceVariables(prompt.content, variableValues) : prompt.content
        }
      />
    </Form>
  );
}
