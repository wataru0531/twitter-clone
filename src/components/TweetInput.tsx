/**************************************************************

ツイートのインプット欄

***************************************************************/
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar, Button, IconButton } from "@material-ui/core";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

import firebase from "firebase/app"; // timestampを取得
import { storage, db, auth } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import styles from "./TweetInput.module.css";


const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);

  // 画像のurlのステート Fileは
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  // ツイートの中に含める画像が選択させると発火
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  // 画像なしのツイートのみで送信できるが、ツイートがなければ投稿できない
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 画像あり ... メッセージと画像の両方ある場合
    if (tweetImage) {

      // 62文字から、ランダムな16の文字を選ぶ
      const S ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      
      const uploadTweetImg = uploadBytesResumable(
        // imagesというフォルダを作り投稿用のファイルデータを格納
        ref(storage, `images/${fileName}`),
        tweetImage
      );
      
      // on() ... storageに対してなんらかのステートの変化があったら実行される
      // 第１引数 ... 
      // 第２引数 ... アップロードの進捗に対して使えるもの
      // 第３引数 ... エラーハンドリング
      // 第４引数 ... 正常に処理が進んだ時の関数
      uploadTweetImg.on(
        "state_changed",
        () => {}, // 特にないので空にしておく
        (err) => {
          alert(err.message);
        },
        async () => {
          // 画像のurlを取得して、メッセージなど内容と共に投稿する
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(
            async (url) => {
              addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: serverTimestamp(),
                username: user.displayName,
              });
            }
          );
        }
      );
    } else { // テキストのみ投稿
      
      addDoc(collection(db, "posts"), {
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
    }

    // 画像とメッセージのステートがある場合は、リセット
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={ sendTweet }>
        <div className={styles.tweet_form}>

          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}

            // サインアウト
            onClick={async () => {
              await auth.signOut();
            }}
          />

          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={ tweetMsg }
            onChange={(e) => setTweetMsg(e.target.value)}
          />

          <IconButton>
            {/* Labelでinputを囲うとファイツダイアログが表示される */}
            <label>
              <AddAPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />

              {/* ツイートに入れる画像 */}
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={ onChangeImageHandler }
              />
            </label>
          </IconButton>

        </div>
        <Button
          type="submit"
          // ツイートメッセージが空の時はボタンを無効化
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
