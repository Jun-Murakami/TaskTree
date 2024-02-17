import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { theme, darkTheme } from './mui_theme';
import { CssBaseline, ThemeProvider, Button,CircularProgress } from '@mui/material';

import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

//const analytics = getAnalytics(app);

const auth = getAuth();

function Main() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ローディング状態を管理する状態変数
  const [token, setToken] = useState<string | null>(null); // Googleのアクセストークンを保持するための状態

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setIsLoggedIn(true);
  
        // Firebase経由でGoogleのアクセストークンを取得
        user.getIdTokenResult().then((idTokenResult) => {
          if ('google.com' in idTokenResult.claims) {
            // claimsの型を明示的に指定
            const claims = idTokenResult.claims as { 'google.com': { access_token: string } };
            const accessToken = claims['google.com'].access_token;
            setToken(accessToken); // 状態を更新
          } else {
            console.error("'google.com' property is not found in claims");
          }
        });
  
        setLoading(false);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);


  const handleLogin = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive'); // Google Driveのスコープを追加
    signInWithRedirect(auth, provider);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setLoading(false); // ログアウト後にローディング状態をfalseに設定
      setIsLoggedIn(false);
    });
  };

  // ローディング中はローディングインジケーターを表示
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <CssBaseline />
      {isLoggedIn ? (
        <>
          <App darkMode={darkMode} setDarkMode={setDarkMode} token={token} />
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 30,
            }}
          >
            ログアウト
          </Button>
        </>
      ) : (
        <Button onClick={handleLogin} variant={'contained'}>
          Googleでログイン
        </Button>
      )}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
