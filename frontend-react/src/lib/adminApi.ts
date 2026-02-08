const API_BASE_URL = "";

const TOKEN_KEY = "adminToken";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 401) {
    throw new Error("Invalid credentials");
  }

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  setToken(data.token);
  return data.token;
}

export async function adminFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  if (!token) {
    window.location.href = "/admin/login";
    throw new Error("No token");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  return res;
}

export interface AdminPetition {
  id: string;
  slug: string;
  nameEng: string;
  nameDhiv: string;
  signatureCount: number;
  startDate: string;
  isApproved: boolean;
  authorDetails?: { name: string };
}

export async function fetchAdminPetitions(): Promise<AdminPetition[]> {
  const res = await adminFetch(`${API_BASE_URL}/api/admin/petitions`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP error: ${res.status}`);
  }
  return res.json();
}

export async function createPetitionFolder(): Promise<string> {
  const res = await adminFetch(
    `${API_BASE_URL}/api/admin/create-petition-folder`,
  );
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  return res.text();
}

export async function updatePetitionApproval(
  petitionId: string,
  isApproved: boolean,
): Promise<void> {
  const res = await adminFetch(
    `${API_BASE_URL}/api/admin/petitions/${petitionId}/approve`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP error: ${res.status}`);
  }
}

export function getExportUrl(petitionId: string): string {
  return `${API_BASE_URL}/api/admin/export/${petitionId}`;
}
