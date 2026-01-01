export interface HttpClientOptions {
  headers?: Record<string, string>;
}

declare const process: { env: { TEST_BACKEND_URL?: string } } | undefined;

function getDefaultBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.TEST_BACKEND_URL) {
    return process.env.TEST_BACKEND_URL;
  }
  return '/api';
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = getDefaultBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, options?: HttpClientOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return this.handleResponse(response);
  }

  async post<T>(path: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(response);
  }

  async patch<T>(path: string, body: unknown, options?: HttpClientOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text);
  }
}
