import { ActionPanel, Action, Detail, Icon, showToast, Toast } from "@raycast/api";
import { Session } from "./types";
import { createFocusMateAPI, formatSessionTime, getSessionStatus } from "./utils";
import { useState } from "react";

interface SessionDetailProps {
  session: Session;
  onSessionUpdate?: () => void;
}

export function SessionDetail({ session, onSessionUpdate }: SessionDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const sessionStatus = getSessionStatus(session);

  const handleCancelSession = async () => {
    setIsLoading(true);
    try {
      const api = createFocusMateAPI();
      await api.cancelSession(session.id);
      await showToast({
        style: Toast.Style.Success,
        title: "Session cancelled",
        message: "Your focus session has been cancelled",
      });
      onSessionUpdate?.();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to cancel session",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markdown = `
# Focus Session Details

**Start Time:** ${formatSessionTime(session.start_time)}
**End Time:** ${formatSessionTime(session.end_time)}
**Status:** ${sessionStatus.status}
**Session ID:** ${session.id}

${
  session.partner
    ? `
## Partner Information
**Name:** ${session.partner.name}
${session.partner.timezone ? `**Timezone:** ${session.partner.timezone}` : ""}
`
    : "**No partner assigned yet**"
}

---

${sessionStatus.status === "Active" ? "🟢 **Session is currently active**" : ""}
${sessionStatus.status === "Upcoming" ? "🟡 **Session is upcoming**" : ""}
${sessionStatus.status === "Completed" ? "✅ **Session completed**" : ""}
${sessionStatus.status === "Cancelled" ? "❌ **Session cancelled**" : ""}
  `.trim();

  return (
    <Detail
      markdown={markdown}
      isLoading={isLoading}
      actions={
        <ActionPanel>
          {session.session_url && sessionStatus.status !== "cancelled" && (
            <Action.OpenInBrowser title="Join Session" url={session.session_url} icon={Icon.Video} />
          )}

          {(sessionStatus.status === "Upcoming" || sessionStatus.status === "Active") && (
            <Action
              title="Cancel Session"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={handleCancelSession}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
