import type {
  AuthConfig,
  BossOverview,
  ChatMessage,
  DailyReport,
  MachineSnapshot,
  OperatorOverview,
  UploadResponse,
  User,
  UserRole
} from "@machine-health/shared";

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as T;
}

export const api = {
  getHealth: () => request<{ status: string }>("/health"),
  getAuthConfig: () => request<AuthConfig>("/auth/config"),
  login: (payload: { email: string; password: string; role: UserRole }) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  signUp: (payload: { name: string; email: string; password: string; role: UserRole }) =>
    request<{ requireEmailVerification: boolean }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  verifyEmail: (payload: { email: string; otp: string; role: UserRole; name: string }) =>
    request<{ user: User }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  startOAuth: (payload: { provider: string; redirectTo: string }) =>
    request<{ url: string; codeVerifier: string }>("/auth/oauth/start", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  exchangeOAuth: (payload: { code: string; codeVerifier: string; role: UserRole }) =>
    request<{ user: User }>("/auth/oauth/exchange", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getOperatorOverview: () => request<OperatorOverview>("/overview/operator"),
  getBossOverview: () => request<BossOverview>("/overview/boss"),
  getMachine: (machineId: string) => request<MachineSnapshot>(`/machines/${machineId}`),
  getMessages: () => request<ChatMessage[]>("/chat/messages"),
  sendMessage: (payload: {
    senderId: string;
    receiverId: string;
    role: UserRole;
    message: string;
  }) =>
    request<ChatMessage>("/chat/messages", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getDailyReport: (format: "json" | "pdf" = "json") =>
    request<DailyReport | string>(`/reports/daily?format=${format}`),
  getDailyReportJson: () => request<DailyReport>("/reports/daily"),
  uploadTelemetry: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/upload-csv`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json() as Promise<UploadResponse>;
  }
};
