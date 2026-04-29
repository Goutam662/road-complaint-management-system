import axios from "axios";

const defaultApiBase = process.env.NODE_ENV === "production"
  ? (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000")
  : "http://localhost:5000";

const rawApiBase = process.env.REACT_APP_API_BASE_URL
  ? process.env.REACT_APP_API_BASE_URL.trim().replace(/\/+$/g, "")
  : defaultApiBase;

const normalizedApiOrigin = rawApiBase.replace(/\/api$/i, "");
const apiOrigin = normalizedApiOrigin.replace(/\/+$/g, "");
export const API_ASSET_BASE_URL = apiOrigin;
export const API_BASE_URL = `${apiOrigin}/api`;

const getAuthToken = () => {
  const rawToken = localStorage.getItem("token") || localStorage.getItem("adminToken");

  if (!rawToken) {
    return "";
  }

  let cleaned = String(rawToken).trim().replace(/^"|"$/g, "");
  cleaned = cleaned.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned || cleaned === "null" || cleaned === "undefined") {
    return "";
  }

  return cleaned;
};

// headers function (same rehne de)
const getHeaders = () => {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!contentType.includes('application/json')) {
    const endpoint = response.url || 'API endpoint';
    throw new Error(`Expected JSON from ${endpoint}, but received non-JSON response.`);
  }

  const data = responseText ? JSON.parse(responseText) : {};
  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred');
  }
  return data;
};

// Auth Service
export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    return handleResponse(response);
  }
};

// Complaint Service
export const complaintService = {
  uploadComplaint: async (formData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Session expired. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/complaints/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  getComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/complaints?${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateComplaint: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

// Admin Service
export const adminService = {
  register: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  getComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/complaints?${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateComplaintStatus: async (complaintId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // create additional admin (must be logged in as admin)
  createAdmin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  deleteComplaint: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(response);
  },

  getAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/admins`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  deleteAdmin: async (adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Chat Service
export const chatService = {
  sendMessage: async (message) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // no auth required for assistant
      body: JSON.stringify({ message })
    });
    return handleResponse(response);
  }
};

export default API_BASE_URL;
