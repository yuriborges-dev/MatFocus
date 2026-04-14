import axios from "axios"

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("matfocus_access")

  const url = config.url ?? ""

  const isAuthRoute =
    url.includes("/auth/login/") ||
    url.includes("/auth/register/") ||
    url.includes("/token/refresh/")

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})