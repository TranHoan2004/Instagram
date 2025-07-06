import { EnvelopeIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from '~/components/layout/header/ThemeSwitcher'
import { useNavigate, useSearchParams, type MetaFunction } from 'react-router'
import { useEffect, useState } from 'react'
import { addToast, Button } from '@heroui/react'
import { resendVerificationEmail, verifyEmail } from '~/services/email.service'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Verify Your Email' }]
}

const EmailVerifyPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const id = searchParams.get('id') || ''
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setEmail(sessionStorage.getItem('verify-email') || '')
  }, [])

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token, id)
        addToast({
          title: 'Email verified successfully',
          color: 'success',
          description: 'Sign in now to enjoy with Midia!',
          radius: 'sm'
        })
        const timeout = setTimeout(() => navigate('/signin'), 3000)

        return () => clearTimeout(timeout)
      } catch {
        addToast({
          title: 'Failed to verify email',

          description: 'Please resend the new verification email',
          radius: 'sm'
        })
      }
    }

    if (!token || !id) return

    verify()
  }, [token, id])

  const handleResendClick = async () => {
    try {
      await resendVerificationEmail(email)
      addToast({
        title: 'Verification email resent',
        color: 'success',
        description: `Check your inbox at ${email}`,
        radius: 'sm'
      })
    } catch (error) {
      console.error(error)
      addToast({
        title: 'Failed to resend email',
        color: 'danger',
        description: 'Something went wrong. Please try again later',
        radius: 'sm'
      })
    }
  }

  return (
    <div className="relative h-screen w-screen bg-neutral-100 dark:bg-neutral-900 flex justify-center">
      <ThemeSwitcher className="absolute top-4 right-2" />
      <main className="flex flex-col items-center justify-center container mx-auto px-2">
        <EnvelopeIcon className="size-16 mb-5" />
        <h1 className="text-2xl font-bold text-center">
          Please check your email to verify your account
        </h1>
        <p className="text-center mb-5">
          You&apos;re almost there! We sent an email to <strong>{email}</strong>
        </p>
        <p className="text-center mb-5">
          If you don&apos;t see the email, you may need to{' '}
          <strong>check your spam folder</strong>
        </p>
        <p className="text-center mb-5">
          Still can&apos;t find the email? No Problem
        </p>

        <Button
          size="lg"
          radius="sm"
          color="danger"
          className="font-bold"
          onPress={handleResendClick}
        >
          Resend Verification Email
        </Button>
      </main>
    </div>
  )
}

export default EmailVerifyPage
