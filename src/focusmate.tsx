import { ActionPanel, List, Action, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { Session } from "./types";
import { createFocusMateAPI, formatSessionTime, getSessionStatus } from "./utils";
import { SessionDetail } from "./SessionDetail";
import { ScheduleSession } from "./ScheduleSession";
import { FocusNow } from "./FocusNow";

export default function Command() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const api = createFocusMateAPI();
      // Get sessions from today onwards
      const today = new Date().toISOString().split("T")[0];
      const fetchedSessions = await api.getSessions({
        from: today,
        limit: 50,
      });
      setSessions(fetchedSessions);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch sessions",
        message: error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search focus sessions...">
      {sessions.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No sessions found"
          description="You don't have any upcoming focus sessions. Create one to get started!"
          actions={
            <ActionPanel>
              <Action.Push
                title="Focus Now"
                icon={Icon.Bolt}
                target={<FocusNow onSessionStarted={fetchSessions} />}
              />
              <Action.Push
                title="Schedule Session"
                icon={Icon.Plus}
                target={<ScheduleSession onSessionCreated={fetchSessions} />}
              />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={fetchSessions} />
            </ActionPanel>
          }
        />
      ) : (
        sessions.map((session) => {
          const sessionStatus = getSessionStatus(session);
          return (
            <List.Item
              key={session.id}
              icon={{
                source:
                  sessionStatus.status === "Active"
                    ? Icon.Video
                    : sessionStatus.status === "Upcoming"
                      ? Icon.Clock
                      : sessionStatus.status === "Completed"
                        ? Icon.CheckCircle
                        : sessionStatus.status === "Cancelled"
                          ? Icon.XMarkCircle
                          : Icon.Circle,
                tintColor: sessionStatus.color,
              }}
              title={`${formatSessionTime(session.start_time)}`}
              subtitle={session.partner ? `with ${session.partner.name}` : "Solo session"}
              accessories={[{ text: sessionStatus.status }, { text: session.partner?.timezone || "" }]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Show Details"
                    icon={Icon.Eye}
                    target={<SessionDetail session={session} onSessionUpdate={fetchSessions} />}
                  />

                  {session.session_url && sessionStatus.status !== "cancelled" && (
                    <Action.OpenInBrowser
                      title="Join Session"
                      url={session.session_url}
                      icon={Icon.Video}
                      shortcut={{ modifiers: ["cmd"], key: "o" }}
                    />
                  )}

                  <Action.Push
                    title="Focus Now"
                    icon={Icon.Bolt}
                    target={<FocusNow onSessionStarted={fetchSessions} />}
                    shortcut={{ modifiers: ["cmd"], key: "f" }}
                  />

                  <Action.Push
                    title="Schedule New Session"
                    icon={Icon.Plus}
                    target={<ScheduleSession onSessionCreated={fetchSessions} />}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                  />

                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    onAction={fetchSessions}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
