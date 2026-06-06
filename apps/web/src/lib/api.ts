const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("forge_access_token");
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("forge_access_token", access);
    localStorage.setItem("forge_refresh_token", refresh);
  }

  private clearTokens() {
    localStorage.removeItem("forge_access_token");
    localStorage.removeItem("forge_refresh_token");
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("forge_refresh_token");
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      if (data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, isFormData = false } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    if (!isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      config.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    let res = await fetch(`${this.baseUrl}${endpoint}`, config);

    // Auto-refresh on 401
    if (res.status === 401 && token) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        requestHeaders["Authorization"] = `Bearer ${this.getToken()}`;
        config.headers = requestHeaders;
        res = await fetch(`${this.baseUrl}${endpoint}`, config);
      } else {
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  // ── Auth ──────────────────────────────────────────────
  async register(name: string, email: string, password: string) {
    const data = await this.request<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    if (data.data) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (data.data) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem("forge_refresh_token");
    if (refreshToken) {
      await this.request("/auth/logout", {
        method: "POST",
        body: { refreshToken },
      }).catch(() => {});
    }
    this.clearTokens();
  }

  async getMe() {
    return this.request<ApiResponse<UserInfo>>("/auth/me");
  }

  // ── Presentations ─────────────────────────────────────
  async createPresentation(data: CreatePresentationRequest) {
    return this.request<ApiResponse<PresentationResponse>>("/presentations", {
      method: "POST",
      body: data,
    });
  }

  async listPresentations(page = 0, size = 10) {
    return this.request<ApiResponse<PaginatedResponse<PresentationListItem>>>(
      `/presentations?page=${page}&size=${size}`
    );
  }

  async getPresentation(id: string) {
    return this.request<ApiResponse<PresentationResponse>>(`/presentations/${id}`);
  }

  async deletePresentation(id: string) {
    return this.request<ApiResponse<void>>(`/presentations/${id}`, { method: "DELETE" });
  }

  // ── Resumes ───────────────────────────────────────────
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<ApiResponse<ResumeResponse>>("/resumes/upload", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  }

  async analyzeResume(resumeId: string, jobTitle?: string, jobDescription?: string, companyName?: string) {
    return this.request<ApiResponse<AnalysisResponse>>("/resumes/analyze", {
      method: "POST",
      body: { resumeId, jobTitle, jobDescription, companyName },
    });
  }

  async listResumes(page = 0, size = 10) {
    return this.request<ApiResponse<PaginatedResponse<ResumeResponse>>>(
      `/resumes?page=${page}&size=${size}`
    );
  }

  async getResumeAnalyses(resumeId: string) {
    return this.request<ApiResponse<AnalysisResponse[]>>(`/resumes/${resumeId}/analyses`);
  }

  /**
   * Resume Builder save — serializes structured form data to a JSON blob and
   * POSTs it as a multipart file to the existing /upload endpoint.
   * The backend saves only metadata (title, fileType, filePath); it never
   * reads file content, so this is the correct approach without modifying the API.
   */
  async createBuilderResume(payload: {
    template: string;
    personal: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      portfolio: string;
      summary: string;
    };
    experiences: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      current: boolean;
      bullets: string;
    }>;
    educations: Array<{
      institution: string;
      degree: string;
      field: string;
      year: string;
      gpa: string;
    }>;
    skills: string;
  }) {
    const safeName = payload.personal.name.trim().replace(/\s+/g, "_") || "Resume";
    const fileName = `${safeName}_${payload.template}_builder.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const file = new File([blob], fileName, { type: "application/json" });
    return this.uploadResume(file);
  }

  async deleteResume(resumeId: string) {
    return this.request<ApiResponse<void>>(`/resumes/${resumeId}`, { method: "DELETE" });
  }

  // ── Generic AI ────────────────────────────────────────
  async generateAI(prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
    return this.request<ApiResponse<AIGenerateResponse>>("/ai/generate", {
      method: "POST",
      body: { prompt, systemPrompt, temperature, maxTokens },
    });
  }

  // ── Profile ───────────────────────────────────────────
  async updateProfile(name?: string, avatar?: string) {
    return this.request<ApiResponse<UserInfo>>("/auth/me", {
      method: "PATCH",
      body: { name, avatar },
    });
  }
}

// ── Types ────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  timestamp?: string;
}

export interface AIGenerateResponse {
  content: string;
  provider: string;
  totalTokens: number;
  latencyMs: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  plan: string;
}

export interface CreatePresentationRequest {
  prompt: string;
  sourceType?: string;
  sourceUrl?: string;
  slideCount?: number;
  style?: string;
  tone?: string;
  layout?: string;
}

export interface PresentationResponse {
  id: string;
  title: string;
  prompt: string;
  sourceType: string;
  slideCount: number;
  style: string;
  tone: string;
  status: string;
  version: number;
  slides: SlideResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideResponse {
  id: string;
  order: number;
  title: string;
  content: string;
  notes: string;
  imageUrl?: string;
  layout: string;
}

export interface PresentationListItem {
  id: string;
  title: string;
  sourceType: string;
  slideCount: number;
  status: string;
  createdAt: string;
}

export interface ResumeResponse {
  id: string;
  title: string;
  fileType: string;
  isBuilderCreated: boolean;
  templateId?: string;
  version: number;
  createdAt: string;
}

export interface AnalysisResponse {
  id: string;
  resumeId: string;
  jobTitle?: string;
  companyName?: string;
  overallScore: number;
  atsScore: ScoreSection | null;
  contentScore: ScoreSection | null;
  structureScore: ScoreSection | null;
  skillsScore: ScoreSection | null;
  toneScore: ScoreSection | null;
  missingKeywords: string[];
  recommendations: string[];
  aiProvider: string;
  createdAt: string;
}

export interface ScoreSection {
  score: number;
  tips: { type: string; tip: string; explanation: string }[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const api = new ApiClient(API_BASE);
