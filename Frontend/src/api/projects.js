import client from "./client.js";

export const getMyProjects = ()       => client.get("/projects/my");
export const createProject = (data)   => client.post("/projects", data);
export const getProject    = (id)     => client.get(`/projects/${id}`);
export const updateProject = (id, d)  => client.put(`/projects/${id}`, d);
export const deleteProject = (id)     => client.delete(`/projects/${id}`);
