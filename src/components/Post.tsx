/**************************************************************

投稿データ

***************************************************************/
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

import styles from "./Post.module.css";

type PostProps = {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  // timestamp: Timestamp;
  username: string;
}

type Comment = { // postsへのコメント
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  // timestamp: Timestamp;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));


const Post: React.FC<PostProps> = ({ postId, avatar, image, text, timestamp, username }) => {
  // console.log(timestamp); // Timestamp {seconds: 1697189788, nanoseconds: 599000000}
  // console.log(timestamp.toDate()); // Fri Oct 13 2023 18:36:28 GMT+0900
  // console.log(timestamp.toDate().toLocaleString()); // 2023/10/13 18:36:28

  const classes = useStyles();
  const user = useSelector(selectUser);

  // コメントのステート
  const [ comment, setComment ] = useState("");
  const [ comments, setComments ] = useState<Comment[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      // timestamp: null,
      timestamp: Timestamp,
    },
  ]);

  // trueならばコメント表示
  const [ openComments, setOpenComments ] = useState(false);

  // マウント時にpostsドキュメントのサブコレクション「comments」にアクセスしデータ取得
  useEffect(() => {
    // クエリを作成
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("timestamp", "desc") // 新しい順
    );

    const unSub = onSnapshot(q, (snapshot) => {
      // ステートに格納
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          username: doc.data().username,
          timestamp: doc.data().timestamp,
        }))
      );
    });

    // クリーンアップ関数　アンマウント時に
    return () => {
      unSub();
    };

    // 違う投稿が渡ってきた時に再レンダリング
    // 親コンポーネントで、onSnapshotメソッドを使用してリアルタイムでデータを取得しているため、
    // データベース内の投稿が変更される。そのたびにpostsステートが更新され、
    // 新しいpostIdが渡ってくることで、useEffectが発火する。
  }, [ postId ]);

  // コメントを送信する関数
  const onSubmitNewComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // postsコレクションの中のサブコレクション「comments」に格納していく
    // → comments ... postsのドキュメントに紐づいたコレクション
    addDoc(collection(db, "posts", postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });

    setComment("");
  };

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={ avatar } />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{ username }</span>
              <span className={styles.post_headerTime}>
                {/* javascriptのdata型に変換 */}
                {/* Timestamp {seconds: 1697189788, nanoseconds: 599000000} */}
                {new Date(timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{ text }</p>
          </div>
        </div>
        { image && (
          <div className={styles.post_tweetImage}>
            <img src={ image } alt="tweet" />
          </div>
        )}

        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(prevState => !prevState)}
        />

        {
          // アイコンをクリックしたときだけコメントが見れる。
          openComments && (
            <>
              {
                comments.map((com) => (
                  <div key={com.id} className={styles.post_comment}>
                    <Avatar src={com.avatar} className={classes.small} />

                    <span className={styles.post_commentUser}>@{com.username}</span>
                    <span className={styles.post_commentText}>{com.text} </span>
                    <span className={styles.post_headerTime}>
                      {new Date(timestamp?.toDate()).toLocaleString()}
                    </span>
                  </div>
                ))
              }

              <form onSubmit={ onSubmitNewComment }>
                <div className={styles.post_form}>
                  <input
                    className={styles.post_input}
                    type="text"
                    placeholder="Type new comment..."
                    value={ comment }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setComment(e.target.value)
                    }
                  />
                  <button
                    type="submit"
                    disabled={ !comment } // コメントが空ならば無効化
                    className={
                      comment ? styles.post_button : styles.post_buttonDisable
                    }
                  >
                    <SendIcon className={styles.post_sendIcon} />
                  </button>
                </div>
              </form>

            </>
          )
        }
      </div>
    </div>
  );
};

export default Post;
