import { Button, Input } from '@heroui/react'
import { useNavigate, useLocation } from 'react-router'
import { useState } from 'react'
import { restApiClient } from '~/lib/rest-client'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from '~/components/layout/header/ThemeSwitcher'

const UpdatePassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Lấy userId và resetToken từ URL
  const urlParams = new URLSearchParams(location.search)
  const userId = urlParams.get('userId') || ''
  const resetToken = urlParams.get('resetToken') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    if (!userId || !resetToken) {
      setError('Invalid or expired reset link')
      setIsLoading(false)
      return
    }

    try {
      const mutation = `
        mutation UpdatePassword($input: UpdatePasswordInput!) {
          updatePassword(input: $input) {
            success
            message
          }
        }
      `;
      const variables = { 
        input: {
          userId, resetToken, newPassword
        }
      };
      const res = await restApiClient.post('/graphql', {
        query: mutation,
        variables,
      });
      if (res?.data?.data?.updatePassword?.success) {
        setIsSuccess(true);
      } else {
        setError(res?.data?.data?.updatePassword?.message || 'Error updating password');
      }
    } catch (error: any) {
      setError('Error updating password: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="relative h-screen w-screen bg-neutral-100 dark:bg-black flex justify-center">
        <ThemeSwitcher className="absolute top-4 right-2" />
        <main className="flex flex-col items-center justify-center container mx-auto px-2">
          <div className="w-full max-w-lg p-12">
            <div className="flex flex-col items-center mb-8">
              <LockClosedIcon className="w-12 h-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2 text-center text-neutral-600 dark:text-neutral-300">
                Password Updated Successfully
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 max-w-sm">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-center">
                <Button
                  color="danger"
                  onPress={() => navigate('/signin')}
                  className="text-sm"
                >
                  Go to Login
                </Button>
              </div>
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
            <h1 className="text-2xl font-bold text-center mb-2 text-neutral-800 dark:text-neutral-100">Update Your Password</h1>
            <p className="text-base text-center text-neutral-500 dark:text-neutral-400 max-w-md">
              Enter your new password below. Make sure the password is at least 8 characters long.
            </p>
          </div>
          <form className="w-full space-y-1 mt-3" onSubmit={handleSubmit}>
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isRequired
              size="lg"
              className="text-base py-4 w-full"
              minLength={8}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
              size="lg"
              className="text-base py-4 w-full"
              minLength={8}
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
              className="text-base py-4 font-semibold mt-2"
              startContent={
                !isLoading && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                )
              }
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
          <div className="relative flex items-center my-8 w-full">
            <div className="flex-grow border-t border-foreground-300"></div>
            <span className="flex-shrink mx-6 text-foreground-500 text-lg">OR</span>
            <div className="flex-grow border-t border-foreground-300"></div>
          </div>
          <div className="text-center">
            <Button
              variant="light"
              size="sm"
              onPress={() => navigate('/signin')}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UpdatePassword