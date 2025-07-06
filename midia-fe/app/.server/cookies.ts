import { createCookie } from 'react-router'

export const accessTokenCookie = (maxAge?: number) =>
  createCookie('access_token', {
    maxAge,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })

export const refreshTokenCookie = (maxAge?: number) =>
  createCookie('refresh_token', {
    maxAge,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })
