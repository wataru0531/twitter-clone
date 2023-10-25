/**************************************************************

Reduxストア

***************************************************************/
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";


export const store = configureStore({
  reducer: {
    user: userReducer,

  }
})

// Reduxストアの全体的な状態（state）を表す型。
export type RootState = ReturnType<typeof store.getState>;


// ThunkActionの型エイリアス
// ReduxのToolkitを使用してReduxストアを構成し、アプリケーションのアクションに対する非同期処理を定義
// RootStateを使用することで、非同期処理がReduxストアの状態にアクセスできる。
// これにより、型安全性が向上し、コードの保守性が高まります。
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,    // アクションが返す値の型
  RootState,     // Reduxストアの全体的な状態を表す型
  unknown,       // 追加の引数として渡される任意の値の型
  Action<string> // Reduxアクションの型
>;
