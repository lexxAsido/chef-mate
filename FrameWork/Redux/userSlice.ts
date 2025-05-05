import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface UserState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    fullname: string | null; 
    avatar?: string | null;
  } | null;
}


const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
