import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded function to support both old and new signatures
export async function apiRequest(
  url: string,
  methodOrOptions?: string | {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  },
  data?: unknown
): Promise<any> {
  let method = "GET";
  let body: any = undefined;
  let headers: Record<string, string> = {};

  // Support old signature: apiRequest(url, method, data)
  if (typeof methodOrOptions === "string") {
    method = methodOrOptions;
    body = data;
  } else if (methodOrOptions) {
    // New signature: apiRequest(url, options)
    method = methodOrOptions.method || "GET";
    body = methodOrOptions.body;
    headers = methodOrOptions.headers || {};
  }

  // Se body for FormData, não definir Content-Type (deixar o navegador definir)
  const isFormData = body instanceof FormData;
  const requestHeaders = isFormData 
    ? headers 
    : body 
    ? { "Content-Type": "application/json", ...headers }
    : headers;

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
