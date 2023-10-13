/**************************************************************



***************************************************************/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";


type User = {
  displayName: string,
  photoUrl: string,
}


export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: { uid: "", photoUrl: "", displayName: "" },
  },

  reducers: {
    login: (state, action) => {
      state.user = action.payload; // actionオブジェクトを格納
    },

    logout: (state) => {
      state.user = { uid: "", photoUrl: "", displayName: "" };
    },

    // 名前と写真のurlを更新
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user.displayName = action.payload.displayName;
      state.user.photoUrl = action.payload.photoUrl;
    },
  },
});

// reducer名がそのままaction名となる
export const { login, logout, updateUserProfile } = userSlice.actions;

// 型付きのuserを取得する
export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
