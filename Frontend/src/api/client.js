import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  withCredentials: true,          // sends HTTPOnly cookies automatically
  headers: { "Content-Type": "application/json" },
});

// Attach in-memory access token (set by AuthContext) to every request
client.interceptors.request.use((config) => {
  const token = window.__metos_token__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent token refresh on 401 — retries once before redirecting to /login
let refreshing = false;
let waitQueue = [];

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (refreshing) {
        return new Promise((resolve, reject) =>
          waitQueue.push({ resolve, reject })
        ).then(() => client(original));
      }

      refreshing = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? "/api/v1"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        window.__metos_token__ = data.data?.accessToken ?? null;
        waitQueue.forEach(({ resolve }) => resolve());
        waitQueue = [];
        return client(original);
      } catch (refreshErr) {
        waitQueue.forEach(({ reject }) => reject(err));
        waitQueue = [];
        window.__metos_token__ = null;
        // DO NOT forcefully redirect here, it causes infinite reload loops.
        // Protected routes will handle redirection via ProtectedRoute component.
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default client;
