import client from "./client.js";

export const getConnections = ()    => client.get("/connections");
export const getPending     = ()    => client.get("/connections/pending");
export const getSent        = ()    => client.get("/connections/sent");

export const sendRequest = async (uid) => {
  const res = await client.post(`/connections/request/${uid}`);
  window.dispatchEvent(new Event("connectionUpdated"));
  return res;
};

export const accept = async (cid) => {
  const res = await client.post(`/connections/accept/${cid}`);
  window.dispatchEvent(new Event("connectionUpdated"));
  return res;
};

export const reject = async (cid) => {
  const res = await client.post(`/connections/reject/${cid}`);
  window.dispatchEvent(new Event("connectionUpdated"));
  return res;
};

export const cancel = async (cid) => {
  const res = await client.delete(`/connections/cancel/${cid}`);
  window.dispatchEvent(new Event("connectionUpdated"));
  return res;
};

export const remove = async (uid) => {
  const res = await client.delete(`/connections/${uid}`);
  window.dispatchEvent(new Event("connectionUpdated"));
  return res;
};
