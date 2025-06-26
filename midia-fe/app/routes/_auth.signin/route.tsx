import {
  Link,
  redirect,
  useFetcher,
  type ActionFunction,
  type ActionFunctionArgs,
  type MetaFunction
} from 'react-router'
import SignInForm from './SignInForm'
import { Button } from '@heroui/react'
import GoogleColoredIcon from '~/components/icons/GoogleColoredIcon'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Sign In' }]
}

export const action: ActionFunction = async ({
  request
}: ActionFunctionArgs) => {
  const formData = await request.formData()
  const provider = formData.get('provider')
  const url = `${import.meta.env.VITE_API_URL}/oauth2/authorization/${provider}`
  return redirect(url)
}

type OAuthProvider = 'google' | 'facebook'

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
        >
          <GoogleColoredIcon className="size-4" />
          <span>Google</span>
        </Button>
      </div>
    </>
  )
}

export default SignInPage
