import React, { useState, useEffect } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { findMaxId, isDescendantOfTrash } from './Tree/utilities';
import { SortableTree } from './Tree/SortableTree';
import type { TreeItem } from './Tree/types';
import { styled } from '@mui/material/styles';
import { FormControlLabel, Switch, Button, Box, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './App.css';

interface AppProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  token: string|null;
}

const initialItems: TreeItem[] = [
  {
    id: '0',
    value: '案件1',
    done: false,
    children: [
      { id: '1', value: 'すぐやる', done: false, children: [
        { id: '2', value: 'Aさんに電話を掛ける\n000-0000-0000', done: false, children: [] },
        { id: '3', value: 'Bさんにメールを返す', done: true, children: [] },
      ] },
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

function App({ darkMode, setDarkMode,token }: AppProps) {
  // 完了したタスクの表示/非表示を制御するための状態
  const [hideDoneItems, setHideDoneItems] = useState(false);
  const [items, setItems] = useState<TreeItem[]>(initialItems);
  const [lastSelectedItemId, setLastSelectedItemId] = useState<UniqueIdentifier | null>(null);

  const handleSelect = (id: UniqueIdentifier) => {
    setLastSelectedItemId(id);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideDoneItems(event.target.checked);
  };

  const addItemToNestedChildren = (items: TreeItem[], parentId: UniqueIdentifier, newItem: TreeItem): TreeItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        if (!item.children) {
          item.children = [];
        }
        item.children.push(newItem);
        return item;
      } else if (item.children) {
        item.children = addItemToNestedChildren(item.children, parentId, newItem);
        return item;
      }
      return item;
    });
  };

  const handleAddTask = () => {
    const newTaskId = findMaxId(items) + 1;
    const newTask = {
      id: newTaskId.toString(),
      value: 'id:' + newTaskId,
      done: false,
      children: []
    };
  
    if (lastSelectedItemId === 'trash' || (lastSelectedItemId !== null && isDescendantOfTrash(items, lastSelectedItemId)) || lastSelectedItemId === null) {
      // ゴミ箱のルートツリーの直前のルートにタスクを追加
      setItems(prevItems => {
        const trashIndex = prevItems.findIndex(item => item.id === 'trash');
        if (trashIndex > 0) {
          // ゴミ箱がリストの最初でない場合、ゴミ箱の直前に新しいタスクを挿入
          const updatedItems = [...prevItems];
          updatedItems.splice(trashIndex, 0, newTask);
          return updatedItems;
        } else {
          // ゴミ箱がリストの最初または見つからない場合、リストの最初に追加
          return [newTask, ...prevItems];
        }
      });
    } else {
      // 以前のロジックを使用して、選択したアイテムの直下に新しいアイテムを追加
      setItems(prevItems => addItemToNestedChildren(prevItems, lastSelectedItemId, newTask));
    }
  };

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb:before': {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            '#fff',
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' :  theme.palette.primary.light,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor:  theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.primary.main,
      width: 32,
      height: 32,
      '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      borderRadius: 20 / 2,
    },
  }));

    // Google Driveに状態を保存する関数
    const saveAppStateToGoogleDrive = async (token: string, appStateJSON: string) => {
      const metadata = {
        name: 'app_state.json', // ファイル名
        mimeType: 'application/json', // MIMEタイプ
      };
    
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([appStateJSON], { type: 'application/json' }));
    
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': `Bearer ${token}` }),
        body: form,
      });
    
      return response.json(); // 保存したファイルの情報を返す
    };

    // 状態が変更されたとき（例: アイテムの追加、完了タスクの表示/非表示の切り替え、ダークモードの切り替え）に呼び出す
    useEffect(() => {
      if (token) { // トークンがnullでないことを確認
        const appState = { items, hideDoneItems, darkMode };
        const appStateJSON = JSON.stringify(appState);
        saveAppStateToGoogleDrive(token, appStateJSON).then(() => {
          console.log("アプリの状態がGoogle Driveに保存されました。");
        }).catch((error) => {
          console.error("アプリの状態の保存に失敗しました。", error);
        });
      }
    }, [items, hideDoneItems, darkMode, token]);

  return (
    <Box sx={{
      maxWidth: '900px', // 最大幅を指定
      width: '100%', // 横幅いっぱいに広がる
      margin: '0 auto', // 中央寄せ
    }}>
      <Typography variant='h3'>Task Tree</Typography>
      <Stack direction={'row'} spacing={2} sx={{marginTop: '30px', marginBottom: '20px', justifyContent: 'center'}}>
        <Button variant='contained' color='primary' startIcon={<AddIcon />} sx={{width: '150px'}} onClick={handleAddTask}>タスク追加</Button>
        <FormControlLabel
          control={<Switch checked={hideDoneItems} onChange={handleSwitchChange} />}
          label='完了タスクを非表示'
        />
        <FormControlLabel
          control={<MaterialUISwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Mode"
        />
      </Stack>
      <SortableTree collapsible indicator removable hideDoneItems={hideDoneItems} items={items} setItems={setItems} onSelect={handleSelect}/>
    </Box>
  );
}

export default App;
