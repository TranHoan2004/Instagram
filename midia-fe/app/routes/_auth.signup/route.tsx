import { Image, Link } from '@heroui/react'
import SignUpForm from './SignUpForm'
import BrandLogo from '~/components/ui/BrandLogo'
import ThemeSwitcher from '~/components/layout/header/ThemeSwitcher'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Sign Up' }]
}

const SignUpPage = () => {
  return (
    <>
      <h1 className="text-2xl font-bold my-4 text-center text-neutral-600 dark:text-neutral-300">
        Sign up now
      </h1>
      <SignUpForm />
      <p className="text-center mt-4">
        Have an account?
        <Link className="hover:underline text-primary ml-1" href="/signin">
          Sign in
        </Link>
      </p>
    </>
  )
}

export default SignUpPage
