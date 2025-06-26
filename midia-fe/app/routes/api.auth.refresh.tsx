import { gql } from '@apollo/client/index.js'
import type { Route } from './+types/api.auth.refresh'
import { createCookie, type ActionFunction } from 'react-router'
import { accessTokenCookie } from '~/.server/cookies'
import { makeClient } from '~/lib/graphql-client'

const REFRESH_TOKEN_MUT = gql`
  mutation refreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      accessTokenExpiresIn
      message
    }
  }
`

export const action: ActionFunction = async ({ request }: Route.ActionArgs) => {
  const cookiesHeaders = request.headers.get('Cookies')

  const refreshCookie = createCookie('refresh_token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  const [cookie, formData] = await Promise.all([
    refreshCookie.parse(cookiesHeaders),
    request.formData()
  ])
  const refreshToken = cookie || formData.get('refreshToken')

  const client = makeClient(request)

  try {
    const response = await client.mutate({
      mutation: REFRESH_TOKEN_MUT,
      variables: {
        refreshToken
      }
    })
    const data = response.data?.refreshToken
    const accessToken = data?.accessToken
    const accessExpires = data?.accessTokenExpiresIn
    const message = data?.message

    if (accessToken && accessExpires) {
      return new Response(JSON.stringify({ message }), {
        headers: {
          'Set-Cookie': await accessTokenCookie(
            Number(accessExpires)
          ).serialize(accessToken)
        },
        status: 200
      })
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return new Response(JSON.stringify({ message: 'Error refreshing token' }), {
      status: 401
    })
  }
}
