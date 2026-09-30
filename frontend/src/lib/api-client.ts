import {
  Challenge,
  Feedback,
  PortfolioProject,
  Skill,
  Submission,
  TokenResponse,
  User,
  UserSkill,
} from "@/types/api";

const BASE_URL = "/api/v1";

class ApiClientError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAuthToken = (): string | null => {
  return inMemoryToken;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (inMemoryToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Essential for HttpOnly session cookies & CORS
  });

  if (response.status === 204) {
    return {} as T;
  }

  let data: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred";

    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: any) => err.msg).join(", ");
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (typeof data === "string" && data.trim()) {
      errorMessage = data;
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) {
        errorMessage = `Rate limited. Please wait ${retryAfter} seconds.`;
      }
    }

    throw new ApiClientError(errorMessage, response.status, data);
  }

  return data as T;
}

// 1. Auth API
export const authApi = {
  register: (payload: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    role?: string;
  }) => request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }),

  login: async (payload: { email: string; password: string }) => {
    const data = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      setAuthToken(null);
    }
  },

  getCurrentUser: () => request<User>("/auth/me", { method: "GET" }),
};

// 2. Challenges API
export const challengesApi = {
  list: (params?: { difficulty?: string; skill_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.difficulty) query.append("difficulty", params.difficulty);
    if (params?.skill_id) query.append("skill_id", params.skill_id);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<{ items: Challenge[]; total: number }>(`/challenges${qs}`, {
      method: "GET",
    });
  },

  getBySlug: (slug: string) =>
    request<Challenge>(`/challenges/${slug}`, { method: "GET" }),
};

// 3. Submissions API
export const submissionsApi = {
  create: (payload: {
    challenge_id: string;
    repository_url: string;
    deployed_url?: string;
    notes?: string;
  }) =>
    request<Submission>("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMy: () =>
    request<{ items: Submission[]; total: number }>("/submissions/my", {
      method: "GET",
    }),

  getById: (id: string) =>
    request<Submission>(`/submissions/${id}`, { method: "GET" }),

  getFeedback: (id: string) =>
    request<Feedback>(`/submissions/${id}/feedback`, { method: "GET" }),
};

// 4. Portfolios API
export const portfoliosApi = {
  listPublic: (username: string) =>
    request<{ items: PortfolioProject[]; total: number }>(
      `/portfolio-projects/public/${username}`,
      { method: "GET" }
    ),

  getMy: () =>
    request<{ items: PortfolioProject[]; total: number }>(
      "/portfolio-projects/my",
      { method: "GET" }
    ),

  create: (payload: {
    title: string;
    slug: string;
    summary: string;
    repository_url: string;
    live_demo_url?: string;
    submission_id?: string;
    is_featured?: boolean;
    is_public?: boolean;
  }) =>
    request<PortfolioProject>("/portfolio-projects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: Partial<{
      title: string;
      summary: string;
      repository_url: string;
      live_demo_url?: string;
      is_featured?: boolean;
      is_public?: boolean;
    }>
  ) =>
    request<PortfolioProject>(`/portfolio-projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/portfolio-projects/${id}`, {
      method: "DELETE",
    }),
};

// 5. Skills API
export const skillsApi = {
  list: () => request<{ items: Skill[]; total: number }>("/skills", { method: "GET" }),
  getMy: () => request<{ items: UserSkill[]; total: number }>("/skills/my", { method: "GET" }),
  addSkill: (payload: { skill_id: string; proficiency_level: string }) =>
    request<UserSkill>("/skills/my", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export { ApiClientError };
