import client from "./client.js";

export const login           = (data) => client.post("/auth/login", data);
export const register        = (data) => client.post("/auth/register", data);
export const logout          = ()     => client.post("/auth/logout");
export const getMe           = ()     => client.get("/auth/me");
export const updateProfile   = (data) => client.put("/auth/update", data);
export const checkUsername   = (u)    => client.get(`/auth/check-username?username=${encodeURIComponent(u)}`);
export const forgotPassword  = (data) => client.post("/auth/forgot-password", data);
export const resetPassword   = (data) => client.post("/auth/reset-password", data);
export const toggleDarkMode  = ()     => client.put("/auth/darkmode");
export const refreshTokens   = ()     => client.post("/auth/refresh");
