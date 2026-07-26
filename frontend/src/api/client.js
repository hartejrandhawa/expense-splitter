const API_BASE = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Request failed");
    throw new Error(errText || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

export const api = {
  register: (data) => request("/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) => request("/auth/login", { method: "POST", body: data, auth: false }),

  createGroup: (data) => request("/groups", { method: "POST", body: data }),
  getMyGroups: () => request("/groups"),
  getGroup: (id) => request(`/groups/${id}`),

  addExpense: (groupId, data) => request(`/groups/${groupId}/expenses`, { method: "POST", body: data }),
  getExpenses: (groupId) => request(`/groups/${groupId}/expenses`),

  getSettlement: (groupId) => request(`/groups/${groupId}/settlement`),
};
