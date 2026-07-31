import client from "./client.js";

export const listGroups  = (params) => client.get("/groups", { params });
export const getMyGroups = ()       => client.get("/groups/my");
export const createGroup = (data)   => client.post("/groups", data);
export const getGroup    = (id)     => client.get(`/groups/${id}`);
export const updateGroup = (id, d)  => client.put(`/groups/${id}`, d);
export const closeGroup  = (id)     => client.patch(`/groups/${id}/close`);
export const leaveGroup  = (id)     => client.delete(`/groups/${id}/leave`);
export const removeUser  = (id, u)  => client.delete(`/groups/${id}/remove/${u}`);
export const deleteGroup = (id)     => client.delete(`/groups/${id}`);
