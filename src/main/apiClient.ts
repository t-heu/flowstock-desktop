const API_URL = import.meta.env.MAIN_VITE_API_URL;

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  token?: string;
};

export async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Erro na requisição API");
    }

    return result;
  } catch (err: any) {
    throw new Error(err?.message === "fetch failed" ? "Falha na conexão com servidor" : err.message)
  }
}
