import { Button, Input } from '@heroui/react'
import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { sendResetPasswordEmail } from '../../services/email.service';
import { LockClosedIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from '~/components/layout/header/ThemeSwitcher'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      // Gửi email reset password (bao gồm cả việc kiểm tra email tồn tại)
      await sendResetPasswordEmail(email)
      setIsEmailSent(true)
    } catch (error: any) {
      // Xử lý lỗi từ API
      if (error?.response?.status === 400) {
        setError(error?.response?.data?.message || 'Email address does not exist in the system.')
      } else {
        setError('An error occurred while sending the reset email.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="relative h-screen w-screen bg-neutral-100 dark:bg-black flex justify-center">
        <ThemeSwitcher className="absolute top-4 right-2" />
        <main className="flex flex-col items-center justify-center container mx-auto px-2">
          <div className="w-full max-w-lg p-12">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <h2 className="text-3xl font-bold mb-4 text-center text-neutral-800 dark:text-neutral-100">
                Check your email
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                We've sent a password reset link to:
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center mb-8 max-w-md">
                <strong>{email}</strong>
              </p>
              
              <Button
                variant="light"
                size="lg"
                onPress={() => navigate('/signin')}
                className="text-lg px-8 py-3"
              >
                Back to login
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-neutral-100 dark:bg-black flex justify-center">
      <ThemeSwitcher className="absolute top-4 right-2" />
      <main className="flex flex-col items-center justify-center container mx-auto px-2">
        <div className="w-full max-w-lg p-12">
          <div className="flex flex-col items-center mb-8">
            <LockClosedIcon className="w-12 h-12 mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-center mb-2 text-neutral-800 dark:text-neutral-100">Forgot your password?</h1>
            <p className="text-base text-center text-neutral-500 dark:text-neutral-400 max-w-md">
              Enter your email address below and we’ll send you a link to reset your password. If you don’t see the email, please check your spam folder.
            </p>
          </div>
          <form className="w-full space-y-6 mt-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              size="lg"
              className="text-base py-4 w-full"
            />
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-base">
                <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              color="danger"
              fullWidth
              radius="md"
              isLoading={isLoading}
              size="lg"
              className="text-base py-4 font-semibold"
              startContent={
                !isLoading && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              }
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="relative flex items-center my-8 w-full">
            <div className="flex-grow border-t border-foreground-300"></div>
            <span className="flex-shrink mx-6 text-foreground-500 text-lg">OR</span>
            <div className="flex-grow border-t border-foreground-300"></div>
          </div>
          <div className="text-center">
            <Link
              to="/signup"
              className="text-lg font-medium text-neutral-600 dark:text-neutral-300 hover:underline"
            >
              Create new account
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link
              className="text-lg font-medium text-neutral-600 dark:text-neutral-300 hover:underline"
              to="/signin"
            >
              Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ForgotPassword
