import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { TreeItem } from './Tree/types';
import { initialItems } from './Tree/mock';
import './index.css';
import { theme, darkTheme } from './mui_theme';
import { CssBaseline, ThemeProvider, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';

interface AppState {
  items: TreeItem[];
  hideDoneItems: boolean;
  darkMode: boolean;
}

function Main() {
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState<TreeItem[]>([]);
  const [hideDoneItems, setHideDoneItems] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // Googleのアクセストークンを保持するための状態

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoggedIn(true);
      setToken(tokenResponse.access_token);
    },
    onError: (errorResponse) => console.log(errorResponse),
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const handleLogout = () => {
    googleLogout();
    setIsLoggedIn(false);
  };

  const isValidAppState = (appState: AppState): boolean => {
    const hasTrash = appState.items.some((item: TreeItem) => item.id === 'trash');
    const hasHideDoneItems = typeof appState.hideDoneItems === 'boolean';
    const hasDarkMode = typeof appState.darkMode === 'boolean';
    return hasTrash && hasHideDoneItems && hasDarkMode;
  };

  useEffect(() => {
    const restoreAppState = async () => {
      setIsLoading(true);
      if (isLoggedIn && token) {
        const fileName = 'TaskTree.json';
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`, {
          method: 'GET',
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        });
        const result = await response.json();
        const fileId = result.files.length > 0 ? result.files[0].id : null;

        if (fileId) {
          const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${token}` }),
          });
          const appState = await fileResponse.json();

          if (isValidAppState(appState)) {
            setItems(appState.items);
            setHideDoneItems(appState.hideDoneItems);
            setDarkMode(appState.darkMode);
          } else {
            setItems(initialItems);
          }
        } else {
          // ファイルが存在しない場合、initialItemsを使用して状態を初期化
          setItems(initialItems);
        }
      }
      setIsLoading(false);
    };

    restoreAppState();
  }, [isLoggedIn, token]);

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
            token={token}
          />
          {isLoading && <CircularProgress />}
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
          <Paper sx={{ maxWidth: 300, margin: 'auto', marginTop: 4 }}>
            <Typography variant='body2' sx={{ textAlign: 'left', p: 2 }} gutterBottom>
              このアプリケーションはユーザーデータの保存にGoogle Driveを使用します。
              <br />
              最初のログイン時には、Google Driveにアクセスするための許可が必要です。
              <br />
              Google Driveへのアクセスはこのアプリケーションが作成したファイルのみが対象となります。
              <br />
              また、ユーザーデータがサービス提供者に送信されることはありません。
            </Typography>
          </Paper>
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
