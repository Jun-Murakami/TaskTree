import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { TreeItem } from './Tree/types';
import './index.css';
import { theme, darkTheme } from './mui_theme';
import { useTheme } from '@mui/material/styles';
import { CssBaseline, ThemeProvider, Button, CircularProgress } from '@mui/material';

import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';

const initialItems: TreeItem[] = [
  {
    id: '0',
    value: '案件1',
    done: false,
    children: [
      {
        id: '1',
        value: 'すぐやる',
        done: false,
        children: [
          { id: '2', value: 'Aさんに電話を掛ける\n000-0000-0000', done: false, children: [] },
          { id: '3', value: 'Bさんにメールを返す', done: true, children: [] },
        ],
      },
      { id: '4', value: 'あとでやる', done: false, children: [] },
      { id: '5', value: '後で考える', done: false, children: [] },
      { id: '6', value: 'いつかやる', done: false, children: [] },
    ],
  },
  {
    id: '7',
    value: '案件2',
    done: false,
    children: [
      { id: '8', value: 'すぐやる', done: false, children: [] },
      { id: '9', value: 'あとでやる', done: false, children: [] },
    ],
  },
  {
    id: '10',
    value: 'プライベート',
    done: false,
    children: [],
  },
  {
    id: 'trash',
    value: 'Trash',
    children: [],
  },
];

interface AppState {
  items: TreeItem[];
  hideDoneItems: boolean;
  darkMode?: boolean; // darkModeはオプショナルと仮定しています
}

function Main() {
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState<TreeItem[]>([]);
  const [hideDoneItems, setHideDoneItems] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // Googleのアクセストークンを保持するための状態

  const utheme = useTheme();

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
              backgroundColor: utheme.palette.background.default,
            }}
          >
            ログアウト
          </Button>
        </>
      ) : (
        <Button onClick={() => handleLogin()} variant={'contained'}>
          Googleでログイン
        </Button>
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
