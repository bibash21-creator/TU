/**
 * Next-Gen API Client for Nova Oracle
 * Centralized fetch logic with environment awareness
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:9099").replace(/\/$/, "");

export const api = {
  async get(endpoint: string) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  async upload(endpoint: string, file: File) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  getVoiceUrl(text: string, lang: string = "en") {
    const endpoint = `/voice?text=${encodeURIComponent(text)}&lang=${lang}`;
    return `${API_BASE_URL}${endpoint}`;
  }
};
