import axios from 'axios'

export const getToken = async () => {
  const resp = await axios.get('/api/auth/token', {
    withCredentials: true
  })
  return resp?.data?.accessToken
}

export const refreshToken = async (refreshToken?: string) => {
  const resp = await axios.post(
    '/api/auth/refresh',
    { refreshToken },
    {
      withCredentials: true
    }
  )
  return resp?.data?.accessToken
}
