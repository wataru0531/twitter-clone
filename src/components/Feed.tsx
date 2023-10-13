/**************************************************************

ログイン後のダッシュボード

***************************************************************/
import React, { useState, useEffect } from "react";
import styles from "./Feed.module.css";
import { db } from "../firebase";

import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import TweetInput from "./TweetInput";
import Post from "./Post";


const Feed: React.FC = () => {
  const [ posts, setPosts ] = useState([
    {
      avatar: "",
      id: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    // データ取得
    // クエリを作成
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc")); // 降順(新しい投稿が上)

    const unSub = onSnapshot(q, (snapshot) => { // onSnapshot ... リアルタイムでレンダリングされる
      // console.log(snapshot); // QuerySnapshot{...}

      // postsステートに格納
      // 各プロパティには、doc.、data()でアクセスできる
      setPosts(
        snapshot.docs.map((doc) => ({
          avatar: doc.data().avatar,
          id: doc.id,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    
    // クリーンアップ関数
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={styles.feed}>
      
      <TweetInput />

      {posts[0]?.id && (
        <>
          {posts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Feed;
