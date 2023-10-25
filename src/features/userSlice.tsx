/**************************************************************



***************************************************************/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

// displayNameと画像の写真
type User = {
  displayName: string,
  photoUrl: string,
}


export const userSlice = createSlice({
  name: "user",
  initialState: {
    // 型推論が起きてここで型定義が行われる
    user: { uid: "", photoUrl: "", displayName: "" },
  },

  reducers: {
    login: (state, action) => {
      state.user = action.payload; // action.payload...{uid: "", photoUrl: "", displayName: ""}
    },

    logout: (state) => {
      state.user = { uid: "", photoUrl: "", displayName: "" };
    },

    // 名前と写真のurlを更新
    // PayloadAction ... つける必要はないが、型安全性を向上させるためにつける
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user.displayName = action.payload.displayName;
      state.user.photoUrl = action.payload.photoUrl;
    },
  },
});

// reducer名がそのままaction名となる
export const { login, logout, updateUserProfile } = userSlice.actions;


// 型付きのuserを取得する
// state.user ... userという名前のReduxスライス。storeで記述した名前
// state.user.user ... userスライスの中のuserフィールドに格納されたデータ。このファイルのinitialState
export const selectUser = (state: RootState) => state.user.user;


export default userSlice.reducer;
