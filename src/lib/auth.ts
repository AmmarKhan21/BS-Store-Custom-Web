const TOKEN_KEY = "bismillah_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers });
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await adminFetch("/api/admin/me");
    if (!res.ok) {
      clearAdminToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success && data.token) {
      setAdminToken(data.token);
      return { success: true };
    }

    return { success: false, error: data.error || "Invalid credentials" };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminFetch("/api/admin/logout", { method: "POST" });
  } finally {
    clearAdminToken();
  }
}
