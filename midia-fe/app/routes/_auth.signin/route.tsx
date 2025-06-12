import { Link } from 'react-router'
import SignInForm from './SignInForm'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/react'

const SignInPage = () => {
  return (
    <>
      <h1 className="text-2xl font-bold my-4 text-center text-neutral-600 dark:text-neutral-300">
        Sign into your account
      </h1>
      <SignInForm />
      <p className="text-center mt-4">
        Don't have an account? {' '}
        <Link className="hover:underline text-primary" to="/signup">
          Sign up now
        </Link>
      </p>
    </>
  )
}

export default SignInPage
