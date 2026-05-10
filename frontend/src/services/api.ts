import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

export const api = axios.create({
  baseURL: API_URL,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error)
    else if (token) promise.resolve(token)
  })

  failedQueue = []
}

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest.url || "").includes("/token/refresh/")
    ) {
      const refresh = localStorage.getItem("matfocus_refresh")

      if (!refresh) {
        localStorage.removeItem("matfocus_access")
        localStorage.removeItem("matfocus_refresh")
        localStorage.removeItem("matfocus_student")
        window.location.href = "/"
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh,
        })

        const newAccess = response.data.access

        localStorage.setItem("matfocus_access", newAccess)
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`

        processQueue(null, newAccess)

        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        localStorage.removeItem("matfocus_access")
        localStorage.removeItem("matfocus_refresh")
        localStorage.removeItem("matfocus_student")
        window.location.href = "/"

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)