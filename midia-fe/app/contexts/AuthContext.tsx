import { gql, useLazyQuery } from '@apollo/client/index.js'
import { createContext, use, useEffect, useState } from 'react'
import type { User, UserProfile } from '~/lib/graphql-types'

interface AuthContextInterface {
  user: User | null
  isAuthenticated: boolean
  signOut: () => void
  updateUser: (user: Partial<User>) => void
}

const ME = gql`
  query me {
    me {
      id
      username
      email
      role
      profile {
        fullName
        avatarUrl
        birthDate
        phoneNumber
        bio
      }
    }
  }
`

export const AuthContext = createContext<AuthContextInterface | undefined>(
  undefined
)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const isAuthenticated = !!user

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null // Kiem tra gia tri hien tai cua user
      return {
        ...prev, // Giu lai gia tri cu
        ...updatedUser, // Cap nhat gia tri moi
        profile: {
          ...prev.profile,
          ...updatedUser.profile
        } as UserProfile
      }
    })
  }

  const [getMe] = useLazyQuery(ME, {
    context: {
      requiresAuth: true
    },

    onCompleted: (data) => {
      setUser(data.me)
    },

    onError: () => {
      setUser(null)
    }
  })

  const signOut = () => {
    setUser(null)
  }

  useEffect(() => {
    getMe()
  }, [])

  return (
    <AuthContext value={{ user, isAuthenticated, signOut, updateUser }}>
      {children}
    </AuthContext>
  )
}

export const useAuth = () => {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
