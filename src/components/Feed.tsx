/**************************************************************

ログイン後のダッシュボード

***************************************************************/
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

import styles from "./Feed.module.css";
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
      // timestamp: Timestamp,
      username: "",
    },
  ]);

  useEffect(() => {
    // postsの全データを取得
    // クエリを作成
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc")); // 降順(新しい投稿が上)

    // onSnapshotメソッドを使用してリアルタイムでデータを取得しているため、
    // データベース内の投稿が変更されるたびにpostsステートが更新され、
    // Postコンポーネントがレンダリングされる
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
      
      {/* 配列の0番目のidがある場合だけレンダリングする */}
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
