import React from 'react'
import ForgotPassword from './ForgotPassword'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Forgot Password' }]
}

const ForgotPasswordPage = () => {
  return <ForgotPassword />
}

export default ForgotPasswordPage
