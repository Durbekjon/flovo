export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempts > 1 && this.isRetryableError(error as Error | { status?: number; message?: string })) {
        await this.delay(this.retryDelay);
        return this.retryRequest(requestFn, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: Error | { status?: number; message?: string }): boolean {
    // Retry on network errors or 5xx server errors
    if (error instanceof TypeError) {
      return true;
    }
    
    if ('status' in error && error.status && error.status >= 500 && error.status < 600) {
      return true;
    }
    
    if ('message' in error && error.message && error.message.includes('Failed to fetch')) {
      return true;
    }
    
    return false;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("flovo_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("flovo_token");
          window.location.href = "/login";
        }
      }

      throw error;
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    
    return response.text() as T;
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.retryRequest(async () => {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

// Legacy function for backward compatibility
export async function api<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const method = init?.method || "GET";
  const data = init?.body ? JSON.parse(init.body as string) : undefined;

  switch (method.toUpperCase()) {
    case "GET":
      return apiClient.get<T>(path, init);
    case "POST":
      return apiClient.post<T>(path, data, init);
    case "PUT":
      return apiClient.put<T>(path, data, init);
    case "DELETE":
      return apiClient.delete<T>(path, init);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// Export the client for direct use
export { apiClient };


