import { configureStore } from '@reduxjs/toolkit'
import postModalReducer from './post-modal-slice'

export const store = configureStore({
  reducer: {
    postModal: postModalReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
