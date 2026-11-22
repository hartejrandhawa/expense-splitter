// In dev, Vite proxies /api to the Spring backend. Set VITE_API_URL to point elsewhere.
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

let unauthorizedHandler = null;

/** Called whenever an authenticated request comes back 401 (expired or invalid session). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check that the backend is running.", 0);
  }

  if (!res.ok) {
    if (res.status === 401 && auth && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(await errorMessage(res), res.status);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? res.json() : null;
}

async function errorMessage(res) {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
  } catch {
    // not JSON; fall through
  }
  return `Request failed (${res.status})`;
}

export const api = {
  register: (data) => request("/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) => request("/auth/login", { method: "POST", body: data, auth: false }),

  getMyGroups: () => request("/groups"),
  createGroup: (data) => request("/groups", { method: "POST", body: data }),
  getGroup: (id) => request(`/groups/${id}`),
  addMember: (id, username) => request(`/groups/${id}/members`, { method: "POST", body: { username } }),

  getExpenses: (groupId) => request(`/groups/${groupId}/expenses`),
  addExpense: (groupId, data) => request(`/groups/${groupId}/expenses`, { method: "POST", body: data }),
  deleteExpense: (groupId, expenseId) =>
    request(`/groups/${groupId}/expenses/${expenseId}`, { method: "DELETE" }),
  recordPayment: (groupId, data) => request(`/groups/${groupId}/payments`, { method: "POST", body: data }),

  getBalances: (groupId) => request(`/groups/${groupId}/balances`),
  getSettlement: (groupId) => request(`/groups/${groupId}/settlement`),
};
