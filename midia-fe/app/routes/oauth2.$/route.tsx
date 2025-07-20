import { redirect, type LoaderFunction } from 'react-router'
import { accessTokenCookie, refreshTokenCookie } from '~/.server/cookies'

export const loader: LoaderFunction = async ({ request }) => {
  const oAuth2RedirectUrl = process.env.VITE_OAUTH2_REDIRECT_URL
  const url = new URL(request.url)
  if (`${url.origin}${url.pathname}` === oAuth2RedirectUrl) {
    return handleOAuth2LoginRedirect(url)
  }

  return redirect('/404')
}

const handleOAuth2LoginRedirect = async (url: URL) => {
  const accessToken = url.searchParams.get('access_token')
  const refreshToken = url.searchParams.get('refresh_token')
  const accessTokenExpiresIn = url.searchParams.get('access_token_expires_in')
  const refreshTokenExpiresIn = url.searchParams.get('refresh_token_expires_in')
  const error = url.searchParams.get('error')

  if (error) {
    return redirect('/signin')
  }

  const [accessTokenSetCookie, refreshTokenSetCookie] = await Promise.all([
    accessTokenCookie(Number(accessTokenExpiresIn)).serialize(accessToken),
    refreshTokenCookie(Number(refreshTokenExpiresIn)).serialize(refreshToken)
  ])

  return redirect('/', {
    //@ts-expect-error err
    headers: {
      'Set-Cookie': [accessTokenSetCookie, refreshTokenSetCookie]
    }
  })
}
