import type { ActionFunction } from 'react-router'
import { accessTokenCookie, refreshTokenCookie } from '~/.server/cookies'

export const action: ActionFunction = async () => {
  const [accessToken, refreshToken] = await Promise.all([
    accessTokenCookie(0).serialize('', { expires: new Date(0) }),
    refreshTokenCookie(0).serialize('', { expires: new Date(0) })
  ])

  return new Response(null, {
    status: 204,
    //@ts-expect-error err
    headers: {
      'Set-Cookie': [accessToken, refreshToken]
    }
  })
}
