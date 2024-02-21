import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { TreeItem } from './Tree/types';
import { useAppStateSync } from './hooks/useAppStateSync';
import './index.css';
import { theme, darkTheme } from './mui_theme';
import { CssBaseline, ThemeProvider, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';

function Main() {
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState<TreeItem[]>([]);
  const [hideDoneItems, setHideDoneItems] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date(0));

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoggedIn(true);
      setToken(tokenResponse.access_token);
      setMessage(null);
    },
    onError: (errorResponse) => setMessage(errorResponse.toString()),
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const currentYear = new Date().getFullYear();

  const handleLogout = () => {
    setLastUpdated(new Date(0));
    googleLogout();
    setIsLoggedIn(false);
    setToken(null);
    setItems([]);
    setMessage('ログアウトしました。');
  };

  // 状態の読み込みと保存を行うカスタムフック
  useAppStateSync(
    items,
    setItems,
    hideDoneItems,
    setHideDoneItems,
    darkMode,
    setDarkMode,
    token,
    setToken,
    isLoggedIn,
    setIsLoggedIn,
    setIsLoading,
    setMessage,
    lastUpdated,
    setLastUpdated
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <CssBaseline />
      {isLoggedIn ? (
        <>
          <App
            items={items}
            setItems={setItems}
            hideDoneItems={hideDoneItems}
            setHideDoneItems={setHideDoneItems}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
          {isLoading && <CircularProgress sx={{ marginTop: 2 }} />}
          <Button
            onClick={handleLogout}
            variant='outlined'
            sx={{
              zIndex: 1000,
              position: 'fixed',
              bottom: 20,
              right: 30,
              backgroundColor: theme.palette.background.default,
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Typography sx={{ marginBottom: 4 }} variant='h3'>
            <img src='/TaskTree.svg' alt='Task Tree' style={{ width: '35px', height: '35px', marginRight: '10px' }} />
            TaskTree
          </Typography>
          <Button onClick={() => handleLogin()} variant={'contained'}>
            Googleでログイン
          </Button>
          {message && (
            <Typography variant='body2' sx={{ marginY: 4 }}>
              {message}
            </Typography>
          )}
          <Paper sx={{ maxWidth: 300, margin: 'auto', marginTop: 4 }}>
            <Typography variant='body2' sx={{ textAlign: 'left', p: 2 }} gutterBottom>
              このアプリケーションはユーザーデータの保存にGoogle Driveを使用します。
              <br />
              最初のログイン時には、Google Driveにアクセスするための許可が必要です。
              <br />
              Google
              Driveへのアクセスはこのアプリケーションが作成したファイルのみが対象となります。ユーザーデータがサービス提供者に送信されることはありません。
              <br />
              <br />
              Google Firebase に移行した新バージョンは<a href='https://tasktree-fb.web.app/'>こちら</a>
            </Typography>
          </Paper>
          <Typography variant='caption'>
            <a href='https://github.com/Jun-Murakami/TaskTree'>©{currentYear} Jun Murakami</a>
          </Typography>
        </>
      )}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_DRIVE_API_KEY}>
      <Main />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
