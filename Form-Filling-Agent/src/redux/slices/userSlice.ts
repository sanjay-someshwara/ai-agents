import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  submit: boolean | false;
}

const initialState: UserState = {
  name: null,
  email: null,
  phone: null,
  address: null,
  submit: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string | null; email: string | null; phone: string | null; address: string | null }>) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.phone = action.payload.phone;
        state.address = action.payload.address;
      },
      resetUser: (state, action: PayloadAction<{submit: boolean | false}>) => {
        state.submit = action.payload.submit;
      },
  },
});

export const { setUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
