const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const request = async (endpoint, payload) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

export const registerUser = (payload) => request("/api/auth/register", payload)
export const loginUser = (payload) => request("/api/auth/login", payload)
