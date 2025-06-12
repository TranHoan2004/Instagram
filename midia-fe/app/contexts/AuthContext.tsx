import { createContext, use, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { User } from '~/lib/types'
import type { RootState } from '~/redux/store'
import {
  signIn as signInAction,
  signOut as signOutAction
} from '~/redux/auth-slice'

interface AuthContextInterface {
  user: User | null
  signIn: (user: User) => void
  signOut: () => void
  isAuthenticated: boolean
  isAuthorized: (...roles: string[]) => boolean
}

export const AuthContext = createContext<AuthContextInterface | undefined>(
  undefined
)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  )

  const signIn = useCallback(
    (user: User) => {
      dispatch(signInAction(user))
    },
    [dispatch]
  )

  const signOut = useCallback(() => {
    dispatch(signOutAction())
  }, [dispatch])

  const isAuthorized = useCallback(
    (...roles: string[]) => {
      return isAuthenticated && roles.includes(user?.role || '')
    },
    [isAuthenticated, user]
  )

  const contextValue = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      isAuthenticated,
      isAuthorized
    }),
    [user, signIn, signOut, isAuthenticated, isAuthorized]
  )

  return <AuthContext value={contextValue}>{children}</AuthContext>
}

export const useAuth = () => {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
