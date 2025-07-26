import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface PostModalState {
  isOpen: boolean
  selectedIndex: number | null
}

const initialState: PostModalState = {
  isOpen: false,
  selectedIndex: null
}

export const postModalSlice = createSlice({
  name: 'postModal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ selectedIndex: number }>) => {
      state.isOpen = true
      state.selectedIndex = action.payload.selectedIndex
    },
    closeModal: (state) => {
      state.isOpen = false
      state.selectedIndex = null
    },
    setSelectedIndex: (
      state,
      action: PayloadAction<{ selectedIndex: number | null }>
    ) => {
      state.selectedIndex = action.payload.selectedIndex
    }
  }
})

export const { openModal, closeModal, setSelectedIndex } =
  postModalSlice.actions

export default postModalSlice.reducer
