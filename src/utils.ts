import { getPreferenceValues } from "@raycast/api";
import { FocusMateAPI } from "./api";

interface Preferences {
  apiKey: string;
}

export function createFocusMateAPI(): FocusMateAPI {
  const preferences = getPreferenceValues<Preferences>();

  if (!preferences.apiKey) {
    throw new Error(
      "❌ No API key found. Please get your personal API key from FocusMate Settings page and add it to the extension preferences.",
    );
  }

  if (preferences.apiKey.length < 20) {
    throw new Error("❌ API key appears to be too short. Please check your FocusMate API key.");
  }

  return new FocusMateAPI(preferences.apiKey);
}

export function formatSessionTime(isoString: string): string {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function getSessionStatus(session: { status: string; start_time: string; end_time: string }): {
  status: string;
  color: string;
} {
  const now = new Date();
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  if (session.status === "cancelled") {
    return { status: "Cancelled", color: "#ff6b6b" };
  }

  if (session.status === "completed") {
    return { status: "Completed", color: "#51cf66" };
  }

  if (now >= startTime && now <= endTime) {
    return { status: "Active", color: "#4c6ef5" };
  }

  if (now < startTime) {
    return { status: "Upcoming", color: "#ffd43b" };
  }

  return { status: "Past", color: "#868e96" };
}
