import { redirect } from 'react-router'
import { refreshTokenCookie } from './cookies'

export const requireAuth = async (request: Request) => {
  const cookie = request.headers.get('cookie')

  const refreshToken = await refreshTokenCookie().parse(cookie)

  if (refreshToken === null || refreshToken === undefined) {
    throw redirect('/signin')
  }
}
