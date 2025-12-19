# PromptCast

Your personal AI prompt library for Raycast. Save prompts with variables, organize them with tags, and launch them instantly to Claude or ChatGPT.

## Features

- **Save & Organize Prompts**: Create a personal library of AI prompts with tags for easy organization
- **Variable Support**: Use `{variableName}` syntax to create reusable prompts with dynamic values
- **Multi-AI Launch**: Send prompts to Claude or ChatGPT with a single keystroke
- **Quick Search**: Find prompts by title, content, or tags
- **Keyboard-First**: Full keyboard shortcut support for power users

## Commands

### My AI Prompts

Browse, search, and launch your saved prompts.

| Shortcut | Action |
|----------|--------|
| `⌘ + L` | Launch to AI Apps (select which apps) |
| `⌘ + C` | Quick Launch to Claude |
| `⌘ + G` | Quick Launch to ChatGPT |
| `⌘ + E` | Edit Prompt |
| `⌘ + D` | View Details |
| `⌘ + .` | Copy Prompt Content |
| `⌃ + X` | Delete Prompt |

### Create AI Prompt

Save a new prompt to your library with optional tags and variables.

## Variable Syntax

Use curly braces to define variables in your prompts:

```
Explain {concept} in simple terms for a {audience}.
```

When you launch a prompt with variables, you'll be asked to fill in the values:

- `{concept}` → "machine learning"
- `{audience}` → "5-year-old"

The final prompt becomes:

```
Explain machine learning in simple terms for a 5-year-old.
```

## Examples

### Code Review Prompt

```
Review this {language} code for:
- Security vulnerabilities
- Performance issues
- Best practices

Code:
{code}
```

### Writing Assistant

```
Help me write a {tone} {format} about {topic}.
Target audience: {audience}
Word count: approximately {length} words
```

### Learning Helper

```
I'm learning {subject}. Explain {concept} with:
1. A simple definition
2. A real-world analogy
3. A practical example
```

## How It Works

1. **Create**: Save prompts using the "Create AI Prompt" command
2. **Organize**: Add tags to categorize your prompts
3. **Search**: Use the search bar to find prompts by title, content, or tags
4. **Launch**: Select a prompt and launch it to your preferred AI app

When launching a prompt with variables:
1. Select the AI app(s) you want to use
2. Fill in the variable values
3. The prompt opens in your browser with the values substituted

## Supported AI Apps

| App | URL |
|-----|-----|
| Claude | claude.ai |
| ChatGPT | chatgpt.com |

## Data Storage

All prompts are stored locally on your device using Raycast's LocalStorage. No data is sent to external servers.
