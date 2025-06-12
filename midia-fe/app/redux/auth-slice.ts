import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '~/lib/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    signIn: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    signOut: (state) => {
      state.user = null
      state.isAuthenticated = false
    }
  }
})

export const { setUser, signIn, signOut } = authSlice.actions

export default authSlice.reducer
