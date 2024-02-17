import { createTheme } from '@mui/material/styles';
import '@fontsource/m-plus-1p';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e748d',
    },
    secondary: {
      main: '#ef0a0a',
    },
  },
  
  typography: {
    fontFamily: [
      '"M PLUS Rounded 1c"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2e748d',
    },
    secondary: {
      main: '#ef0a0a',
    },
  },
  typography: {
    fontFamily: [
      '"M PLUS Rounded 1c"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});