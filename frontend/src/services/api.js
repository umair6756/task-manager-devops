const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const request = async ({ endpoint, method = "GET", payload, token }) => {
  const headers = { "Content-Type": "application/json" }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  })

  let data = {}
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const message = data?.message || "Something went wrong. Please try again."
    throw new Error(message)
  }

  return data
}

export const registerUser = (payload) =>
  request({ endpoint: "/api/auth/register", method: "POST", payload })
export const loginUser = (payload) =>
  request({ endpoint: "/api/auth/login", method: "POST", payload })

export const getTasks = (token) => request({ endpoint: "/api/tasks", token })
export const createTask = (payload, token) =>
  request({ endpoint: "/api/tasks", method: "POST", payload, token })
export const updateTask = (id, payload, token) =>
  request({ endpoint: `/api/tasks/${id}`, method: "PUT", payload, token })
export const deleteTask = (id, token) =>
  request({ endpoint: `/api/tasks/${id}`, method: "DELETE", token })
