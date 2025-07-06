import { gql } from '@apollo/client/index.js'
import type { Route } from '../api.auth.refresh/+types/route'
import { type ActionFunction } from 'react-router'
import { accessTokenCookie, refreshTokenCookie } from '~/.server/cookies'
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
  const cookiesHeaders = request.headers.get('cookie')

  const [cookie, json] = await Promise.all([
    refreshTokenCookie().parse(cookiesHeaders),
    request.json()
  ])
  const refreshToken = cookie || json?.refreshToken

  const client = makeClient(request)

  try {
    const response = await client.mutate({
      mutation: REFRESH_TOKEN_MUT,
      fetchPolicy: 'no-cache',
      variables: {
        refreshToken
      }
    })

    if (response.errors) {
      console.error('Error refreshing token:', response.errors)
      return new Response(
        JSON.stringify({ message: 'Error refreshing token' }),
        {
          status: 401
        }
      )
    }

    const data = response.data?.refreshToken
    const accessToken = data?.accessToken
    const accessExpires = data?.accessTokenExpiresIn
    const message = data?.message

    if (accessToken && accessExpires) {
      return new Response(JSON.stringify({ message, accessToken }), {
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
