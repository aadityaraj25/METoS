import client from "./client.js";

export const create = (groupId) => client.post(`/join-requests/${groupId}`);
export const getPending = (groupId) => client.get(`/join-requests/group/${groupId}`);
export const accept = (requestId) => client.post(`/join-requests/${requestId}/accept`);
export const reject = (requestId) => client.post(`/join-requests/${requestId}/reject`);
