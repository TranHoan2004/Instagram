import { type ActionFunction, type LoaderFunction } from 'react-router'
import type { Route } from '../api.auth.token/+types/route'
import { accessTokenCookie, refreshTokenCookie } from '~/.server/cookies'

export const action: ActionFunction = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const accessToken = formData.get('accessToken')
  const accessTokenExpiresIn = formData.get('accessTokenExpiresIn')
  const refreshToken = formData.get('refreshToken')
  const refreshTokenExpiresIn = formData.get('refreshTokenExpiresIn')

  const [accessTokenSetCookie, refreshTokenSetCookie] = await Promise.all([
    accessTokenCookie(Number(accessTokenExpiresIn)).serialize(accessToken),
    refreshTokenCookie(Number(refreshTokenExpiresIn)).serialize(refreshToken)
  ])

  return new Response(JSON.stringify({ message: 'Success' }), {
    //@ts-ignore
    headers: {
      'Set-Cookie': [accessTokenSetCookie, refreshTokenSetCookie]
    },
    status: 200
  })
}

export const loader: LoaderFunction = async ({ request }: Route.LoaderArgs) => {
  const cookieHeaders = request.headers.get('cookie')
  const accessToken = await accessTokenCookie().parse(cookieHeaders)

  return new Response(JSON.stringify({ accessToken }), {
    status: 200
  })
}
