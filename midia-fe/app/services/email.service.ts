import { restApiClient } from '~/lib/rest-client'

export const verifyEmail = async (token: string, id: string) => {
  return restApiClient.get(`/api/v1/verify-email?token=${token}&id=${id}`)
}

export const resendVerificationEmail = async (email: string) => {
  return restApiClient.post('/api/v1/verify-email/resend', { email })
}

export const sendResetPasswordEmail = async (email: string) => {
  return restApiClient.post('/api/v1/reset-password', { email })
}

