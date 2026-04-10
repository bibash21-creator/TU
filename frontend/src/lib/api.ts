/**
 * Next-Gen API Client for Nova Oracle
 * Centralized fetch logic with environment awareness
 * Now with cookie-based authentication and CSRF protection
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:9099").replace(/\/$/, "");

let csrfTokenMemory: string | null = null;
function getCsrfToken(): string | null {
  return csrfTokenMemory || document.cookie.match(/csrf_token=([^;]+)/)?.[1] || null;
}

export const api = {
  setCsrfToken(token: string | null) {
    csrfTokenMemory = token;
  },
  async get(endpoint: string) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      credentials: "include", // Include cookies
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async post(endpoint: string, data: any, requireCsrf: boolean = false) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    // Add CSRF token for state-changing operations
    if (requireCsrf) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include", // Include cookies
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async delete(endpoint: string) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = {};
    
    // Add CSRF token for state-changing operations
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include", // Include cookies
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async upload(endpoint: string, file: File) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "POST",
      body: formData,
      credentials: "include", // Include cookies
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return response.json();
  },

  getVoiceUrl(text: string, lang: string = "en") {
    const endpoint = `/voice?text=${encodeURIComponent(text)}&lang=${lang}`;
    return `${API_BASE_URL}${endpoint}`;
  }
};
