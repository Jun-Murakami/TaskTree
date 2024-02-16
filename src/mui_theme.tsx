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
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body, #root {
          height: 100%;
          margin: 0;
        },
        .markdownBody{
          line-height: 1.44;
        },
        .markdownBody img{
          margin : 0;
          width: 100%;
        },
        .markdownBody pre{
          margin : 0;
          font-size: 14px;
        },
        .markdownBody code{
          overflow-x: scroll;
          -webkit-overflow-scrolling: touch;
        },
        .markdownBody ul{
          margin-block-start: 0.2em;
          margin-block-end: 0.2em;
          padding-inline-start: 1em;
        },
        .markdownBody ol{
          margin-block-start: 0;
          margin-block-end: 0;
          padding-inline-start: 1em;
        },
        .markdownBody h1,
        .markdownBody h2,
        .markdownBody h3,
        .markdownBody h4 {
          font-size: 1em;
        },
        .border-all {
          margin : 15px 0 15px 0;
          border-radius: 10px;
        },
        .border-bottom {
          margin : 0 0 15px 0;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        },
        ::-webkit-scrollbar {
          width: 11px;
          height: 11px;
          background-color: #eeeeee;
        },
        ::-webkit-scrollbar:hover {
          background-color: #cccccc;
        },
        ::-webkit-scrollbar-thumb {
          background: #7c7d87;
          opacity: 0.5;
          border-radius: 6px;
        },
        pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{background:#1e1e1e;color:#dcdcdc}.hljs-keyword,.hljs-literal,.hljs-name,.hljs-symbol{color:#569cd6}.hljs-link{color:#569cd6;text-decoration:underline}.hljs-built_in,.hljs-type{color:#4ec9b0}.hljs-class,.hljs-number{color:#b8d7a3}.hljs-meta .hljs-string,.hljs-string{color:#d69d85}.hljs-regexp,.hljs-template-tag{color:#9a5334}.hljs-formula,.hljs-function,.hljs-params,.hljs-subst,.hljs-title{color:#dcdcdc}.hljs-comment,.hljs-quote{color:#57a64a;font-style:italic}.hljs-doctag{color:#608b4e}.hljs-meta,.hljs-meta .hljs-keyword,.hljs-tag{color:#9b9b9b}.hljs-template-variable,.hljs-variable{color:#bd63c5}.hljs-attr,.hljs-attribute{color:#9cdcfe}.hljs-section{color:gold}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}.hljs-bullet,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-selector-tag{color:#d7ba7d}.hljs-addition{background-color:#144212;display:inline-block;width:100%}.hljs-deletion{background-color:#600;display:inline-block;width:100%}
        `,
    },
  },
});
