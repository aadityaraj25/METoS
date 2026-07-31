import client from "./client.js";

// Tasks
export const getTasks = (groupId) => client.get(`/workspace/${groupId}/tasks`);
export const createTask = (groupId, data) => client.post(`/workspace/${groupId}/tasks`, data);
export const updateTaskStatus = (taskId, status) => client.patch(`/workspace/tasks/${taskId}`, { status });
export const deleteTask = (taskId) => client.delete(`/workspace/tasks/${taskId}`);

// Messages
export const getMessages = (groupId) => client.get(`/workspace/${groupId}/messages`);
export const sendMessage = (groupId, content) => client.post(`/workspace/${groupId}/messages`, { content });
