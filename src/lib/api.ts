import { UserProfile, ConversationMessage, GeminiChatResponse, MemoryFact } from '../domain/models';

const TOKEN_KEY = 'fleetbuild_session_token';
const ROLE_KEY = 'fleetbuild_user_role';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserSummary;
  profile?: UserProfile;
}

export interface OnboardingPayload {
  name: string;
  primaryFitnessGoal: string;
  goalFocus: 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'rehab' | 'general_fitness';
  goalDescription?: string;
  equipmentAccess: string[];
  healthConstraints?: string;
  dietaryRestrictions?: string[];
}

export interface ChatResponseData {
  reply: string;
  memoryCandidates: MemoryFact[];
  safetyFlags: GeminiChatResponse['safetyFlags'];
  suggestedActions: GeminiChatResponse['suggestedActions'];
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, role: 'member' | 'admin'): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getStoredRole(): 'member' | 'admin' | null {
  return (localStorage.getItem(ROLE_KEY) as 'member' | 'admin') || null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  async signUp(payload: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(res.token, res.user.role);
    return res;
  },

  async signInUser(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/user/sign-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(res.token, res.user.role);
    return res;
  },

  async signInAdmin(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/admin/sign-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(res.token, res.user.role);
    return res;
  },

  async signOut(): Promise<void> {
    try {
      await request('/api/auth/sign-out', { method: 'POST' });
    } catch {
      // Ignore network errors on sign-out
    } finally {
      clearToken();
    }
  },

  async getMe(): Promise<{ user: UserSummary; profile: UserProfile }> {
    return request<{ user: UserSummary; profile: UserProfile }>('/api/me');
  },

  async getProfile(): Promise<UserProfile> {
    return request<UserProfile>('/api/me/profile');
  },

  async completeOnboarding(payload: OnboardingPayload): Promise<{ message: string; profile: UserProfile }> {
    return request<{ message: string; profile: UserProfile }>('/api/me/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return request<UserProfile>('/api/me/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getMemoryFacts(): Promise<MemoryFact[]> {
    return request<MemoryFact[]>('/api/me/memory');
  },

  async confirmMemory(factId: string, action: 'confirm' | 'reject'): Promise<{ success: boolean; profile?: UserProfile }> {
    return request<{ success: boolean; profile?: UserProfile }>('/api/me/memory/confirm', {
      method: 'POST',
      body: JSON.stringify({ factId, action }),
    });
  },

  async sendChatMessage(message: string, chatHistory: ConversationMessage[] = []): Promise<ChatResponseData> {
    return request<ChatResponseData>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, chatHistory }),
    });
  },

  async getAdminUsers(): Promise<UserSummary[]> {
    return request<UserSummary[]>('/api/admin/users');
  },
};
