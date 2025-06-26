import { type ActionFunction, type LoaderFunction } from 'react-router'
import type { Route } from './+types/api.auth.token'
import { accessTokenCookie } from '~/.server/cookies'

export const action: ActionFunction = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const accessToken = formData.get('accessToken')
  const accessTokenExpiresIn = formData.get('accessTokenExpiresIn')

  return new Response(JSON.stringify({ message: 'Success' }), {
    headers: {
      'Set-Cookie': await accessTokenCookie(
        Number(accessTokenExpiresIn)
      ).serialize(accessToken)
    },
    status: 200
  })
}

export const loader: LoaderFunction = async ({ request }: Route.LoaderArgs) => {
  const cookieHeaders = request.headers.get('cookie')
  const accessToken = await accessTokenCookie().parse(cookieHeaders)
  console.log('accessToken', accessToken)

  return new Response(JSON.stringify({ accessToken }), {
    status: 200
  })
}
