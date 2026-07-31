import client from "./client.js";

export const searchUsers       = (params) => client.get("/users/search", { params });
export const getUserById       = (id)     => client.get(`/users/id/${id}`);
export const getUserByUsername = (un)     => client.get(`/users/${un}`);
