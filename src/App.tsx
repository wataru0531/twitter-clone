/**************************************************************



***************************************************************/
import React, { useEffect } from "react";
import styles from "./App.module.css";
import { useSelector, useDispatch } from "react-redux";

import { auth } from "./firebase";
import { selectUser, login, logout } from "./features/userSlice";

import { onAuthStateChanged } from "firebase/auth";
import Feed from "./components/Feed";
import Auth from "./components/Auth";


const App: React.FC = () => {
  const user = useSelector(selectUser); // 型付きのuserを返す
  const dispatch = useDispatch();

  useEffect(() => {
    
    const unSub = onAuthStateChanged(auth, (authUser) => {
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

    // 
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
