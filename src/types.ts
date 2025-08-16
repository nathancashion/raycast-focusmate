// FocusMate API Types
export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  timezone: string;
}

// Raw API response format from FocusMate
export interface FocusMateApiSession {
  sessionId: string;
  startTime: string; // ISO 8601 datetime
  duration: number; // duration in milliseconds
  users: User[];
}

// Normalized session format for our extension
export interface Session {
  id: string;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  status: "scheduled" | "active" | "completed" | "cancelled";
  partner?: User;
  session_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  start_time: string; // ISO 8601 datetime
  duration_minutes?: number; // defaults to 50
}

export interface SessionsResponse {
  sessions: Session[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
}
