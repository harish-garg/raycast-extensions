import { List, ActionPanel, Action, showToast, Toast, Icon, Color, confirmAlert, Alert, open } from "@raycast/api";
import { useEffect, useState } from "react";
import { getAllPrompts, deletePrompt } from "./lib/storage";
import { extractVariables, hasVariables } from "./lib/variables";
import { generateDeepLink, getAppDisplayName } from "./lib/deeplinks";
import { Prompt, AIApp } from "./types";
import AppSelectionForm from "./components/AppSelectionForm";
import EditPromptForm from "./components/EditPromptForm";

export default function MyAIPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const allPrompts = await getAllPrompts();
      // Sort by most recently updated
      allPrompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPrompts(allPrompts);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Load Prompts",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (prompt: Prompt) => {
    const confirmed = await confirmAlert({
      title: "Delete Prompt",
      message: `Are you sure you want to delete "${prompt.title}"?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        await deletePrompt(prompt.id);
        await showToast({
          style: Toast.Style.Success,
          title: "Prompt Deleted",
          message: `"${prompt.title}" has been removed`,
        });
        await loadPrompts();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to Delete",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const searchLower = searchText.toLowerCase();
    const matchesTitle = prompt.title.toLowerCase().includes(searchLower);
    const matchesContent = prompt.content.toLowerCase().includes(searchLower);
    const matchesTags = prompt.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    return matchesTitle || matchesContent || matchesTags;
  });

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search prompts by title, content, or tags..."
    >
      {filteredPrompts.length === 0 && !isLoading ? (
        <List.EmptyView
          title={searchText ? "No Prompts Found" : "No Prompts Yet"}
          description={
            searchText
              ? "Try a different search term"
              : "Create your first AI prompt using the 'Create AI Prompt' command"
          }
          icon={Icon.Document}
        />
      ) : (
        filteredPrompts.map((prompt) => (
          <List.Item
            key={prompt.id}
            title={prompt.title}
            subtitle={prompt.tags.length > 0 ? prompt.tags.join(", ") : undefined}
            accessories={[
              ...(hasVariables(prompt.content)
                ? [{ tag: { value: "Has Variables", color: Color.Blue }, icon: Icon.Code }]
                : []),
              { date: new Date(prompt.updatedAt), tooltip: `Updated: ${new Date(prompt.updatedAt).toLocaleString()}` },
            ]}
            detail={
              <List.Item.Detail
                markdown={`# ${prompt.title}\n\n${prompt.content}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Title" text={prompt.title} />
                    <List.Item.Detail.Metadata.Separator />

                    {prompt.tags.length > 0 && (
                      <>
                        <List.Item.Detail.Metadata.TagList title="Tags">
                          {prompt.tags.map((tag) => (
                            <List.Item.Detail.Metadata.TagList.Item key={tag} text={tag} color={Color.Green} />
                          ))}
                        </List.Item.Detail.Metadata.TagList>
                        <List.Item.Detail.Metadata.Separator />
                      </>
                    )}

                    {hasVariables(prompt.content) && (
                      <>
                        <List.Item.Detail.Metadata.TagList title="Variables">
                          {extractVariables(prompt.content).map((variable) => (
                            <List.Item.Detail.Metadata.TagList.Item key={variable} text={variable} color={Color.Blue} />
                          ))}
                        </List.Item.Detail.Metadata.TagList>
                        <List.Item.Detail.Metadata.Separator />
                      </>
                    )}

                    <List.Item.Detail.Metadata.Label
                      title="Created"
                      text={new Date(prompt.createdAt).toLocaleString()}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Updated"
                      text={new Date(prompt.updatedAt).toLocaleString()}
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <ActionPanel.Section title="Launch Prompt">
                  <Action.Push
                    title="Launch to AI Apps"
                    icon={Icon.Rocket}
                    target={<AppSelectionForm prompt={prompt} />}
                    shortcut={{ modifiers: ["cmd"], key: "l" }}
                  />
                  <Action
                    title="Quick Launch to Claude"
                    icon={Icon.Link}
                    onAction={() => quickLaunch(prompt, AIApp.Claude)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Quick Launch to ChatGPT"
                    icon={Icon.Link}
                    onAction={() => quickLaunch(prompt, AIApp.ChatGPT)}
                    shortcut={{ modifiers: ["cmd"], key: "g" }}
                  />
                </ActionPanel.Section>

                <ActionPanel.Section title="Manage">
                  <Action.Push
                    title="View Details"
                    icon={Icon.Eye}
                    target={
                      <List isShowingDetail>
                        <List.Item
                          title={prompt.title}
                          detail={
                            <List.Item.Detail
                              markdown={`# ${prompt.title}\n\n${prompt.content}`}
                              metadata={
                                <List.Item.Detail.Metadata>
                                  <List.Item.Detail.Metadata.Label title="Title" text={prompt.title} />
                                  <List.Item.Detail.Metadata.Separator />

                                  {prompt.tags.length > 0 && (
                                    <>
                                      <List.Item.Detail.Metadata.TagList title="Tags">
                                        {prompt.tags.map((tag) => (
                                          <List.Item.Detail.Metadata.TagList.Item
                                            key={tag}
                                            text={tag}
                                            color={Color.Green}
                                          />
                                        ))}
                                      </List.Item.Detail.Metadata.TagList>
                                      <List.Item.Detail.Metadata.Separator />
                                    </>
                                  )}

                                  {hasVariables(prompt.content) && (
                                    <>
                                      <List.Item.Detail.Metadata.TagList title="Variables">
                                        {extractVariables(prompt.content).map((variable) => (
                                          <List.Item.Detail.Metadata.TagList.Item
                                            key={variable}
                                            text={variable}
                                            color={Color.Blue}
                                          />
                                        ))}
                                      </List.Item.Detail.Metadata.TagList>
                                      <List.Item.Detail.Metadata.Separator />
                                    </>
                                  )}

                                  <List.Item.Detail.Metadata.Label
                                    title="Created"
                                    text={new Date(prompt.createdAt).toLocaleString()}
                                  />
                                  <List.Item.Detail.Metadata.Label
                                    title="Updated"
                                    text={new Date(prompt.updatedAt).toLocaleString()}
                                  />
                                </List.Item.Detail.Metadata>
                              }
                            />
                          }
                        />
                      </List>
                    }
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  />
                  <Action.Push
                    title="Edit Prompt"
                    icon={Icon.Pencil}
                    target={<EditPromptForm prompt={prompt} onEdit={loadPrompts} />}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Prompt Content"
                    content={prompt.content}
                    shortcut={{ modifiers: ["cmd"], key: "." }}
                  />
                  <Action
                    title="Delete Prompt"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => handleDelete(prompt)}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

async function quickLaunch(prompt: Prompt, app: AIApp) {
  if (hasVariables(prompt.content)) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Variables Required",
      message: 'Use "Launch to AI Apps" to fill in variables first',
    });
    return;
  }

  try {
    const url = generateDeepLink(app, prompt.content);
    await open(url);
    await showToast({
      style: Toast.Style.Success,
      title: `Launched to ${getAppDisplayName(app)}`,
      message: `"${prompt.title}" opened in ${getAppDisplayName(app)}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Launch",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
