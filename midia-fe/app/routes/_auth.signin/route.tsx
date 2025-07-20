import { Button } from '@heroui/react'
import {
  Link,
  redirect,
  useFetcher,
  type ActionFunction,
  type ActionFunctionArgs,
  type MetaFunction
} from 'react-router'
import GithubColoredIcon from '~/components/icons/GithubColoredIcon'
import GoogleColoredIcon from '~/components/icons/GoogleColoredIcon'
import SignInForm from './SignInForm'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Sign In' }]
}

export const action: ActionFunction = async ({
  request
}: ActionFunctionArgs) => {
  const formData = await request.formData()
  const provider = formData.get('provider')
  const env = import.meta.env
  const url = `${env.VITE_API_URL}/oauth2/authorization/${provider}?redirect_uri=${env.VITE_OAUTH2_REDIRECT_URL}`
  return redirect(url)
}

type OAuthProvider = 'google' | 'facebook' | 'github'

const SignInPage = () => {
  const fetcher = useFetcher()
  const handleAuthorizeWith = (provider: OAuthProvider) => {
    const formData = new FormData()
    formData.append('provider', provider)
    fetcher.submit(formData, {
      method: 'POST'
    })
  }

  return (
    <>
      <h1 className="text-2xl font-bold my-4 text-center text-neutral-600 dark:text-neutral-300">
        Sign into your account
      </h1>
      <div className="w-full max-w-lg mx-auto">
        <SignInForm />
        <p className="text-center my-4">
          Don't have an account?{' '}
          <Link className="hover:underline text-primary" to="/signup">
            Sign up now
          </Link>
        </p>

        <div className="relative flex items-center mb-6 w-full">
          <div className="flex-grow border-t border-foreground-300"></div>
          <span className="flex-shrink mx-4 text-foreground-500 text-sm">
            or sign in with
          </span>
          <div className="flex-grow border-t border-foreground-300"></div>
        </div>

        <Button
          variant="bordered"
          fullWidth
          radius="sm"
          onPress={() => handleAuthorizeWith('google')}
          className="mb-3"
        >
          <GoogleColoredIcon className="size-6" />
          <span>Google</span>
        </Button>

        <Button
          variant="bordered"
          fullWidth
          radius="sm"
          onPress={() => handleAuthorizeWith('github')}
        >
          <GithubColoredIcon className="size-6" />
          <span>GitHub</span>
        </Button>
      </div>
    </>
  )
}

export default SignInPage
