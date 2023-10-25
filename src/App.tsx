/**************************************************************



***************************************************************/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "./firebase";
import { selectUser, login, logout } from "./features/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import Feed from "./components/Feed";
import Auth from "./components/Auth";

import styles from "./App.module.css";



const App: React.FC = () => {
  const user = useSelector(selectUser); // 型付きのuserを返す
  const dispatch = useDispatch();

  useEffect(() => {
    
    // onAuthStateChanged ... 認証状態の変更を監視するためのメソッド。
    // アプリケーションの初期レンダリング時にも発火、認証状態が変化するたびに再度発火します。
    // このAppコンポーネント内はonAuthStateChangedが発火している。
    // <Feed />、<Auth /> はこのコンポーネント内なので常に発火状態
    const unSub = onAuthStateChanged(auth, (authUser) => {
      // console.log(authUser) // UserImpl {}

      if (authUser) {
        dispatch(
          // reducerに通知
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        // 
        dispatch(logout());
      }
    });

    // クリーンアップ関数。Appコンポーネントがアンマウントされたら監視をやめる
    return () => {
      unSub();
    };

    // dispatch自体は変化しない
    // dispatchでアクションをストアに通知 → 値が更新 → 新しいdispatchが生成 → useEffectが発火
  }, [ dispatch ]);

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
