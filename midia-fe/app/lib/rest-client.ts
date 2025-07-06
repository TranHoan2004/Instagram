import axios from 'axios'
import { getToken, refreshToken } from '~/services/auth.service'

export const restApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

restApiClient.interceptors.request.use(
  async (request) => {
    const accessToken = await getToken()
    if (!request.headers.Authorization && accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`
    }
    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)

restApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshToken()
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken
        return restApiClient(originalRequest) // Retry the original request with the new token
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
