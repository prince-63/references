import {createSlice} from '@reduxjs/toolkit'

const MobileSideBarSlice = createSlice({
  name: 'mobileSidebar',
  initialState: {
    isMobileSidebarOpen: false,
    isBottomBarOpen: true,
  },
  reducers: {
    setIsMobileSidebarOpen(state, action) {
      state.isMobileSidebarOpen = action.payload
    },
    setIsBottomBarOpen(state, action) {
      state.isBottomBarOpen = action.payload
    },
  },
})

export const {setIsMobileSidebarOpen, setIsBottomBarOpen} = MobileSideBarSlice.actions
export default MobileSideBarSlice.reducer
