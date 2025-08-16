import axios, { AxiosInstance } from "axios";
import { Session, SessionsResponse, CreateSessionRequest, ApiError, FocusMateApiSession } from "./types";

const FOCUSMATE_API_BASE = "https://api.focusmate.com/v1";

export class FocusMateAPI {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    console.log('🔑 API Key format check:', {
      length: apiKey.length,
      first_chars: apiKey.substring(0, 8) + '...',
      last_chars: '...' + apiKey.substring(apiKey.length - 8)
    });
    
    this.client = axios.create({
      baseURL: FOCUSMATE_API_BASE,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Raycast-FocusMate-Extension/1.0'
      },
    });
  }

  async getSessions(params?: { from?: string; to?: string; status?: string; limit?: number }): Promise<Session[]> {
    try {
      // Set default date range if not provided (today to next week)
      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const queryParams = {
        start: params?.from || now.toISOString(),
        end: params?.to || oneWeekLater.toISOString(),
        ...(params?.status && { status: params.status }),
        ...(params?.limit && { limit: params.limit }),
      };
      
      console.log('🔍 Making request to:', this.client.defaults.baseURL + '/sessions');
      console.log('🔍 With params:', queryParams);
      console.log('🔍 Headers:', this.client.defaults.headers);
      
      const response = await this.client.get<{ sessions: FocusMateApiSession[] }>("/sessions", {
        params: queryParams,
      });
      
      console.log('✅ Response received:', response.status, response.statusText);
      console.log('✅ Raw sessions data:', response.data);
      
      // Transform FocusMate API format to our normalized format
      const normalizedSessions: Session[] = response.data.sessions.map((apiSession) => {
        const startTime = new Date(apiSession.startTime);
        const endTime = new Date(startTime.getTime() + apiSession.duration);
        
        // Determine session status based on timing
        const now = new Date();
        let status: Session['status'] = 'scheduled';
        if (now >= startTime && now <= endTime) {
          status = 'active';
        } else if (now > endTime) {
          status = 'completed';
        }
        
        // Find partner (other user that's not the current user)
        const partner = apiSession.users.length > 1 ? apiSession.users[1] : undefined;
        
        return {
          id: apiSession.sessionId,
          start_time: apiSession.startTime,
          end_time: endTime.toISOString(),
          status: status,
          partner: partner,
          session_url: `https://app.focusmate.com/sessions/${apiSession.sessionId}`,
          created_at: apiSession.startTime, // API doesn't provide this, using start_time as fallback
          updated_at: apiSession.startTime, // API doesn't provide this, using start_time as fallback
        };
      });
      
      console.log('✅ Normalized sessions:', normalizedSessions);
      return normalizedSessions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('❌ API Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
          throw new Error(
            "❌ Invalid API key. Please get your personal API key from FocusMate Settings page and add it to the extension preferences.",
          );
        }

        if (error.response?.data) {
          const apiError = error.response.data;
          throw new Error(apiError.error || apiError.message || `API Error ${error.response.status}: ${error.response.statusText}`);
        }
      }

      throw new Error("Network error while fetching sessions");
    }
  }

  // Note: FocusMate API does not support creating sessions via POST
  // The /v1/sessions endpoint only supports GET, OPTIONS, HEAD methods
  // Users must schedule sessions through the web interface at app.focusmate.com

  async cancelSession(sessionId: string): Promise<void> {
    try {
      await this.client.delete(`/sessions/${sessionId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError: ApiError = error.response.data;
        throw new Error(apiError.message || "Failed to cancel session");
      }
      throw new Error("Network error while canceling session");
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    try {
      const response = await this.client.get<Session>(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError: ApiError = error.response.data;
        throw new Error(apiError.message || "Failed to fetch session");
      }
      throw new Error("Network error while fetching session");
    }
  }
}
