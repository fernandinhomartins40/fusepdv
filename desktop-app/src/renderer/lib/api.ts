import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor para refresh token e retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Retry logic for network errors
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    const isNetworkError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED'

    const shouldRetry = isNetworkError && originalRequest._retryCount < 3
    const retryDelay = Math.pow(2, originalRequest._retryCount) * 1000 // Exponential backoff

    if (shouldRetry) {
      originalRequest._retryCount++
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
      return api(originalRequest)
    }

    // Handle 401 Unauthorized for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        localStorage.setItem('accessToken', data.accessToken)
        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return api(originalRequest)
      } catch (err) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api
