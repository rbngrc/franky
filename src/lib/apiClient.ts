export class ApiClient {
  private static baseUrl = '/api/v1';

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const body = await response.text();
      let detail = response.statusText;
      try {
        const parsed = JSON.parse(body);
        if (parsed.errors) detail = parsed.errors.join('; ');
        else if (parsed.error) detail = parsed.error;
        else if (parsed.message) detail = parsed.message;
      } catch {
        // cuerpo no JSON, se conserva statusText
      }
      if (response.status === 404) {
        throw new Error('Recurso no encontrado');
      }
      throw new Error(detail);
    }

    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }

  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  static async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  static async put<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  static async delete<T = void>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}
