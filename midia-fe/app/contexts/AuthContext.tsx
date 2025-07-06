import { createContext, use, useEffect, useState } from 'react'
import { gql, useLazyQuery } from '@apollo/client/index.js'
import { useNavigate } from 'react-router'
import type { User } from '~/lib/graphql-types'

interface AuthContextInterface {
  user: User | null
  isAuthenticated: boolean
  signOut: () => void
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
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const isAuthenticated = !!user

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
    <AuthContext value={{ user, isAuthenticated, signOut }}>
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
