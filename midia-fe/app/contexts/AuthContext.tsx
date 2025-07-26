import {
  ApolloError,
  gql,
  useMutation,
  useQuery
} from '@apollo/client/index.js'
import { createContext, use } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import type { User, UserProfile } from '~/lib/graphql-types'

interface AuthContextInterface {
  user?: User
  isAuthenticated: boolean
  loading: boolean
  error: ApolloError | undefined
  refetch: () => unknown
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
      stats {
        totalPosts
        totalFollowers
        totalFollowings
      }
    }
  }
`

const SIGN_OUT = gql`
  mutation SignOut {
    logout
  }
`

export const AuthContext = createContext<AuthContextInterface>({
  user: undefined,
  loading: true,
  error: undefined,
  refetch: () => {},
  isAuthenticated: false,
  signOut: () => {}
})

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const fetcher = useFetcher()

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

  const { data, loading, error, refetch } = useQuery(ME, {
    context: {
      requiresAuth: true
    },
    fetchPolicy: 'cache-first'
  })

  const [signOutMutation, { client }] = useMutation(SIGN_OUT, {
    context: {
      requiresAuth: true
    },
    onCompleted: () => {
      client.resetStore()
      navigate('/signin')
    }
  })

  const user = data?.me
  const isAuthenticated = !loading && !error && !!user

  const signOut = async () => {
    await fetcher.submit(null, { method: 'POST', action: '/api/auth/logout' })
    signOutMutation()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, refetch, isAuthenticated, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
