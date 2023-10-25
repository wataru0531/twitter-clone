/**************************************************************

Auth 認証画面

***************************************************************/
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import { auth, provider, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import styles from "./Auth.module.css";


import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword, // 新規登録
  signInWithEmailAndPassword,     // 新規登録後のログイン(displayNameは生成されない)
  updateProfile,
} from "firebase/auth";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from "@material-ui/core";

import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";


// パスワードを忘れた時のCSSの処理
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}


const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage:
      "url(https://images.unsplash.com/photo-1589793907316-f94025b46850?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=932&q=80)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}));



const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ username, setUsername ] = useState("");
  // File ... JavaScriptで用意されている組み込みの型。
  const [ avatarImage, setAvatarImage ] = useState<File | null>(null);

  const [ isLogin, setIsLogin ] = useState(true);

  const [ openModal, setOpenModal ] = useState(false);
  const [ resetEmail, setResetEmail ] = useState("");

  // パスワードを忘れた際にリセットするための関数
  // GoogleのOAuth認証の機能ではなく、メールアドレスとパスワードでアカウントを作ったユーザーに対しての機能
  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {

    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        // 成功した時の処理
        setOpenModal(false);

        setResetEmail("");
      })
      .catch((err) => {
        // 失敗した時の処理
        alert(err.message);

        setResetEmail("");
      });
  };

  // 
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ! ... Typescriptのコンパイラにnullまたはundefinedではないと通知
    // ! がなかったら、コンパイラがnullの可能性があるものに対して[0]へのアクセスができないとエラーを吐く
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);

      // onChangeが毎回反応するように?
      e.target.value = "";
    }
  };

  // ログイン用の関数。メールアドレス、パワワードでサインイン
  // signInWithEmailAndPassword だけでは、displayNameがnullになる。
  // 既に登録されているデータを元にログインするので、displayNameも表示される
  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 新規登録
  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log(authUser); // UserCredentialImpl {}

    // cloud storageにアバター画像を保存。どこに保存するか識別するためのurlを作る
    let url = "";

    if (avatarImage) {
      // ランダムな文字列を作るための候補の文字。ここでは、62文字
      const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16; // 16桁の文字を作るという意味

      // unit32Array ... 符号なしの32ビット。大体43億まで表現できる。
      // その43億のうちの16の要素を取得できる。
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");

      const fileName = randomChar + "_" + avatarImage.name;

      // avatarsフォルダに画像をアップロード
      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);

      // 今アップロードしているファイルのURLを取得、再代入
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }

    // ここでfirebaseが持っている、displayNameとphotoURL を更新
    // メールアドレスとパスワード認証に追加してデータをfirebaseに通知することができる
    if (authUser.user) {
      await updateProfile(authUser.user, { // updateProfile ... authの機能。
        displayName: username,
        photoURL: url,
      });
    }

    dispatch( // reduxにも通知
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  // OnAuth認証。ポップアップ表示でログイン
  // この方式を使えば、displayNameや画像が自動で入る。
  // メールアドレスとパスワードの方式ではdisplayNameやパスワードは自作する必要がある
  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };


  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          {/* タイトル */}
          <Typography component="h1" variant="h5">
            { isLogin ? "Login" : "Register" }
          </Typography>

          {/* フォーム */}
          <form className={classes.form} noValidate>

            {/* 新規登録モードの時のみ表示 */}
            {/* パスワードとメールアドレスのログインではdisplayNameが設定されないために設定 */}
            {!isLogin && (
              <>
                {/* ユーザー名 displayName */}
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={ username }

                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />

                {/* アバター画像を保存する処理 */}
                <Box textAlign="center">
                  <IconButton>
                    {/* labelで囲うことでinputのファイルのダイアログを表示 */}
                    <label>
                      <AccountCircleIcon
                        fontSize="large"
                        className={
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />

                      <input
                        className={ styles.login_hiddenIcon }
                        type="file"
                        onChange={ onChangeImageHandler }
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            {/* 新規登録モードの時のみ */}

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={ email }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={ password }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />

            {/* ログインボタン */}
            <Button
              // true (ログインモードの時) ... メールアドレスがない、6文字未満の場合はボタンを無効化
              // false(新規登録モードの時) ... ユーザー名がない、メールアドレスが6文字未満、アバター画像がない
              disabled={ // trueなら非表示
                isLogin
                  ? !email || password.length < 6
                  : !username || !email || password.length < 6 || !avatarImage
              }

              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                  ? async () => { // ログインモードの時の処理
                      try {
                        await signInEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
                  : async () => { // 登録モードの時の処理
                      try {
                        await signUpEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? "Login" : "Register"}
            </Button>
            {/* ログインボタン */}


            <Grid container>

              {/* パスワードを忘れた時 */}
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => setOpenModal(true)}
                >
                  Forgot password?
                </span>
              </Grid>
              {/* パスワードを忘れた時 */}


              {/* create new account? / Back to login */}
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  { isLogin ? "Create new account ?" : "Back to login" }
                </span>
              </Grid>
              {/* create new account? / Back to login */}

            </Grid>
            
            {/* GoogleOnAuth認証 */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={ signInGoogle }
            >
              SignIn with Google
            </Button>
            {/* GoogleOnAuth認証 */}

          </form>

          {/* パスワードを忘れた際にリセットするためのモーダル */}
          {/* openがtrue、falseで開くか閉じる */}
          <Modal 
            open={ openModal } 
            // onClose...モーダル以外の場所をクリックした時のイベント
            onClose={() => setOpenModal(false)}
          >
            <div style={ getModalStyle() } className={ classes.modal }>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={ resetEmail }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />

                <IconButton onClick={ sendResetEmail }>
                  <SendIcon />
                </IconButton>

              </div>
            </div>
          </Modal>
          {/* パスワードを忘れた際にリセットするためのモーダル */}

        </div>
      </Grid>
    </Grid>
  );
};

export default Auth;
