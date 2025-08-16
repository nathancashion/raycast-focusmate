import { ActionPanel, Action, Detail, showToast, Toast, popToRoot, open } from "@raycast/api";
import { useState } from "react";

interface FocusNowProps {
  onSessionStarted?: () => void;
}

export function FocusNow({ onSessionStarted }: FocusNowProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFocusNow = async () => {
    setIsLoading(true);
    try {
      // Try the direct focus-now URL
      await open("https://app.focusmate.com/focus-now");
      
      await showToast({
        style: Toast.Style.Success,
        title: "Opening Focus Now",
        message: "Look for the blue 'Focus now' button and click it to get matched instantly!",
      });

      onSessionStarted?.();
      popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to open FocusMate",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markdownContent = `
# Focus Now - Instant Session Matching

Focus Now allows you to connect to a partner instantly and start your session as soon as both of you are ready, without scheduling in advance.

## Quick Start Steps

1. **Click "Open FocusMate Dashboard"** below
2. **Click the blue "Focus now" button** (on the left side, below "Book a session")
3. **Click "Start 50 min session"** in the popup that appears
4. **Wait to be matched** with an available partner
5. **Start working together** as soon as you're both ready!

## 🎯 What to Look For

**Step 1**: Blue "Focus now" button on left sidebar  
**Step 2**: Large "Start 50 min session" button in the center of popup

## Session Details

- **Duration**: 50 minutes (only option for Focus Now)
- **Matching**: Based on your preferences (gender, quiet mode, etc.)
- **Timing**: Sessions "snap" to 15-minute intervals for optimal scheduling
- **Requirements**: You must have completed at least 3 regular FocusMate sessions

## Time Alignment

When matched:
- **Matched within first 5 minutes** of a 15-minute block → session starts at beginning of that block
- **Matched after 5+ minutes** → session starts at next 15-minute slot

**Example**: 
- Matched at 1:03 PM → Session runs 1:00-1:50 PM
- Matched at 1:08 PM → Session runs 1:15-2:05 PM

✨ **Tip**: Keep the FocusMate tab open after clicking to see when you get matched!
  `;

  return (
    <Detail 
      isLoading={isLoading}
      markdown={markdownContent}
      actions={
        <ActionPanel>
          <Action 
            title="Open FocusMate Dashboard" 
            onAction={handleFocusNow}
            icon="🚀"
          />
          <Action 
            title="Open Dashboard (Direct)" 
            onAction={() => open("https://app.focusmate.com/dashboard")}
            icon={"🏠"}
          />
          <Action 
            title="Open Main App" 
            onAction={() => open("https://app.focusmate.com")}
            icon={"🌐"}
          />
        </ActionPanel>
      }
    />
  );
}
