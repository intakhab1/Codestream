const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  getRooms: () => request<{ rooms: any[] }>("/api/rooms"),
  getRoom: (id: string) => request<{ room: any }>(`/api/rooms/${id}`),
  createRoom: (data: { name: string; language?: string }) =>
    request<{ room: any }>("/api/rooms", { method: "POST", body: JSON.stringify(data) }),
  deleteRoom: (id: string) =>
    request<{ message: string }>(`/api/rooms/${id}`, { method: "DELETE" }),
  getMessages: (roomId: string) =>
    request<{ messages: any[] }>(`/api/messages/${roomId}`),
};