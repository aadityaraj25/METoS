import client from "./client.js";

export const sendInvite        = (groupId, data) => client.post(`/groups/${groupId}/invite`, data);
export const acceptInvite      = (data)           => client.post("/invite/accept", data);
export const rejectInvite      = (data)           => client.post("/invite/reject", data);
export const getPendingInvites = ()               => client.get("/invite/pending");
