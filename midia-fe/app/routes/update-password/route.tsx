import React from 'react'
import UpdatePassword from './UpdatePassword'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Update Password' }]
}

const UpdatePasswordPage = () => {
  return <UpdatePassword />
}

export default UpdatePasswordPage 