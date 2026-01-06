// src/api/base44Client.js

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function resolveMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}
// Helper: simple filter by object match { published: true }
function matchesWhere(item, where = {}) {
  return Object.entries(where).every(([k, v]) => {
    const current = item?.[k];
    if (current === undefined || current === null) return false;
    return String(current) === String(v);
  });
}

// Helper: sort by "-created_date" or "created_date"
function sortBy(list, sortKey) {
  if (!sortKey) return list;
  const desc = sortKey.startsWith("-");
  const key = desc ? sortKey.slice(1) : sortKey;

  return [...list].sort((a, b) => {
    const av = a?.[key] ?? "";
    const bv = b?.[key] ?? "";
    // date strings compare OK as ISO, but we’ll be safe:
    const ad = new Date(av).getTime() || 0;
    const bd = new Date(bv).getTime() || 0;
    return desc ? bd - ad : ad - bd;
  });
}

function buildQueryParams(where = {}) {
  const params = new URLSearchParams();
  Object.entries(where).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") {
      params.set(key, value ? "true" : "false");
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

async function ensureCsrfToken() {
  const existing = getCookie("csrftoken");
  if (existing) return existing;
  await fetch(`${API_BASE}/api/auth/csrf/`, { credentials: "include" });
  return getCookie("csrftoken");
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = {};
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (writeMethods.includes(method)) {
    const csrfToken = await ensureCsrfToken();
    headers["X-CSRFToken"] = csrfToken || "";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail || "Request failed.";
    throw new Error(detail);
  }
  return payload;
}

async function apiRequestForm(path, { method = "POST", formData } = {}) {
  const headers = {};
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (writeMethods.includes(method)) {
    const csrfToken = await ensureCsrfToken();
    headers["X-CSRFToken"] = csrfToken || "";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: formData,
  });

  if (res.status === 204) return null;
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail || "Request failed.";
    throw new Error(detail);
  }
  return payload;
}

function createEntityApi(entityKey, normalizeItem) {
  const endpoints = {
    Course: "courses",
    Writer: "writers",
    Subscription: "subscriptions",
    Lesson: "lessons",
    MentorshipPackage: "mentorship-packages",
    AvailableSlot: "available-slots",
    Booking: "bookings",
  };
  const endpoint = endpoints[entityKey];
  const normalize = (item) => (normalizeItem ? normalizeItem(item) : item);

  return {
    async list() {
      const items = await apiRequest(`/api/${endpoint}/`);
      return items.map(normalize);
    },
    async filter(where = {}, sortKey) {
      const params = buildQueryParams(where);
      const query = params.toString();
      const items = await apiRequest(`/api/${endpoint}/${query ? `?${query}` : ""}`);
      const normalized = items.map(normalize);
      const filtered = normalized.filter((item) => matchesWhere(item, where));
      return sortBy(filtered, sortKey);
    },
    async create(data) {
      const item = await apiRequest(`/api/${endpoint}/`, { method: "POST", body: data });
      return normalize(item);
    },
    async update(id, updates) {
      const item = await apiRequest(`/api/${endpoint}/${id}/`, { method: "PATCH", body: updates });
      return normalize(item);
    },
    async delete(id) {
      await apiRequest(`/api/${endpoint}/${id}/`, { method: "DELETE" });
      return true;
    },
    async createForm(formData) {
      const item = await apiRequestForm(`/api/${endpoint}/`, { method: "POST", formData });
      return normalize(item);
    },
  };
}

const normalizeCourse = (course) => ({
  ...course,
  image_url: resolveMediaUrl(course.image_file || course.image_url),
});
const normalizeWriter = (writer) => ({
  ...writer,
  image_url: resolveMediaUrl(writer.image_file || writer.image_url),
});

export const kitabApi = {
  auth: {
    async csrf() {
      await fetch(`${API_BASE}/api/auth/csrf/`, {
        credentials: "include",
      });
      return getCookie("csrftoken");
    },
    async me() {
      const res = await fetch(`${API_BASE}/api/auth/me/`, {
        credentials: "include",
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user.");
      return res.json();
    },
    async login({ email, password }) {
      const csrfToken = await this.csrf();
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || "Login failed.");
      }
      return true;
    },
    async register({ fullName, email, password, role }) {
      const csrfToken = await this.csrf();
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || "Registration failed.");
      }
      return true;
    },
    async logout() {
      const csrfToken = getCookie("csrftoken") || (await this.csrf());
      await fetch(`${API_BASE}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
      });
    },
    redirectToLogin(returnTo) {
      window.dispatchEvent(
        new CustomEvent("auth:login-request", { detail: { returnTo } })
      );
    },
  },

  // ✅ entities mock (بديل مؤقت لين Django)
  entities: {
    Course: createEntityApi("Course", normalizeCourse),
    Writer: createEntityApi("Writer", normalizeWriter),
    Subscription: createEntityApi("Subscription"),
    Lesson: createEntityApi("Lesson"),
    MentorshipPackage: createEntityApi("MentorshipPackage"),
    AvailableSlot: createEntityApi("AvailableSlot"),
    Booking: createEntityApi("Booking"),
  },

  integrations: {
    Core: {
      async SendEmail(payload) {
        console.log("Mock email sent", payload);
        return true;
      },
    },
  },
};

// (اختياري) لو حبيت تستخدم default import في بعض الملفات
export default kitabApi;
