import React,{useState} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { theme,darkTheme } from './mui_theme';
import { CssBaseline, ThemeProvider } from '@mui/material';

function Main() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <CssBaseline />
      <App darkMode={darkMode} setDarkMode={setDarkMode}/>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);