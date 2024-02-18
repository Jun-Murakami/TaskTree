import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { findMaxId, isDescendantOfTrash } from './Tree/utilities';
import { SortableTree } from './Tree/SortableTree';
import type { TreeItem } from './Tree/types';
import { styled } from '@mui/material/styles';
import { FormControlLabel, Switch, Button, Box, Typography, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './App.css';

interface AppProps {
  items: TreeItem[];
  setItems: Dispatch<SetStateAction<TreeItem[]>>;
  hideDoneItems: boolean; // この行を追加
  setHideDoneItems: Dispatch<SetStateAction<boolean>>; // この行を追加
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  token: string | null;
}

function App({ items, setItems, hideDoneItems, setHideDoneItems, darkMode, setDarkMode, token }: AppProps) {
  const [lastSelectedItemId, setLastSelectedItemId] = useState<UniqueIdentifier | null>(null);

  const handleSelect = (id: UniqueIdentifier) => {
    setLastSelectedItemId(id);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideDoneItems(event.target.checked);
  };

  const addItemToNestedChildren = (items: TreeItem[], parentId: UniqueIdentifier, newItem: TreeItem): TreeItem[] => {
    return items.map((item) => {
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
      value: '',
      done: false,
      children: [],
    };

    if (
      lastSelectedItemId === 'trash' ||
      (lastSelectedItemId !== null && isDescendantOfTrash(items, lastSelectedItemId)) ||
      lastSelectedItemId === null
    ) {
      // ゴミ箱のルートツリーの直前のルートにタスクを追加
      const newItems = [...items]; // 現在のアイテムのコピーを作成
      const trashIndex = newItems.findIndex((item) => item.id === 'trash');
      if (trashIndex > 0) {
        // ゴミ箱がリストの最初でない場合、ゴミ箱の直前に新しいタスクを挿入
        newItems.splice(trashIndex, 0, newTask);
      } else {
        // ゴミ箱がリストの最初または見つからない場合、リストの最初に追加
        newItems.unshift(newTask); // 配列の先頭に追加
      }
      setItems(newItems); // 更新されたアイテムの配列をセット
    } else {
      // 以前のロジックを使用して、選択したアイテムの直下に新しいアイテムを追加
      const updatedItems = addItemToNestedChildren(items, lastSelectedItemId, newTask);
      setItems(updatedItems);
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
            '#fff'
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : theme.palette.primary.light,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.primary.main,
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
          theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      borderRadius: 20 / 2,
    },
  }));

  // Google DriveからファイルIDを検索する関数
  const getFileIdByName = async (token: string, fileName: string) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`, {
      method: 'GET',
      headers: new Headers({ Authorization: `Bearer ${token}` }),
    });
    const result = await response.json();
    return result.files.length > 0 ? result.files[0].id : null;
  };

  // Google Driveに状態を保存する関数（同名のファイルを上書き）
  const saveOrUpdateAppStateToGoogleDrive = useCallback(async (token: string, appStateJSON: string) => {
    // 条件チェックを追加
    const appState = JSON.parse(appStateJSON);
    const hasTrash = appState.items.some((item: TreeItem) => item.id === 'trash');
    const hasHideDoneItems = typeof appState.hideDoneItems === 'boolean';
    const hasDarkMode = typeof appState.darkMode === 'boolean';

    if (!hasTrash || !hasHideDoneItems || !hasDarkMode) {
      console.error('保存する状態が指定された条件を満たしていません。');
      return;
    }

    const fileName = 'TaskTree.json';
    const fileId = await getFileIdByName(token, fileName);

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([appStateJSON], { type: 'application/json' }));

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    // 既存のファイルが見つかった場合、URLとメソッドを更新
    if (fileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method: method,
      headers: new Headers({ Authorization: `Bearer ${token}` }),
      body: form,
    });

    return response.json();
  }, []); // この関数が依存する外部の変数がない場合は、依存配列を空にします

  // 状態が変更されたとき（例: アイテムの追加、完了タスクの表示/非表示の切り替え、ダークモードの切り替え）に呼び出す
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      if (token) {
        const appState = { items, hideDoneItems, darkMode };
        const appStateJSON = JSON.stringify(appState);
        saveOrUpdateAppStateToGoogleDrive(token, appStateJSON)
          .then(() => {
            //console.log("アプリの状態がGoogle Driveに保存されました。");
          })
          .catch((error: unknown) => {
            console.error('アプリの状態の保存に失敗しました。', error);
          });
      }
    }, 3000); // 3秒のデバウンス

    return () => clearTimeout(debounceSave); // コンポーネントがアンマウントされるか、依存配列の値が変更された場合にタイマーをクリア
  }, [items, hideDoneItems, darkMode, token, saveOrUpdateAppStateToGoogleDrive]);

  return (
    <Box
      sx={{
        maxWidth: '900px', // 最大幅を指定
        width: '100%', // 横幅いっぱいに広がる
        margin: '0 auto', // 中央寄せ
      }}
    >
      <Typography variant='h3'><img src="/TaskTree.svg" alt="Task Tree" style={{ width: '35px', height: '35px',marginRight: '10px' }} />TaskTree</Typography>
      <Grid container spacing={2} justifyContent="center" sx={{ marginTop: {xs:0, sm:'30px'}, marginBottom: '20px' }}>
        <Grid item xs={12} sm={3} sx={{display: {xs: 'none', sm:'block'}}}>
          <Button variant='contained' color='primary' startIcon={<AddIcon />} sx={{ width: '100%' }} onClick={handleAddTask}>
            タスクを追加
          </Button>
        </Grid>
        <Grid item xs={8} sm={3}>
          <FormControlLabel control={<Switch checked={hideDoneItems} onChange={handleSwitchChange} />} label='完了を非表示' />
        </Grid>
        <Grid item xs={4} sm={3}>
          <FormControlLabel
            control={<MaterialUISwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label='Mode'
          />
        </Grid>
      </Grid>
      <SortableTree
        collapsible
        indicator
        removable
        hideDoneItems={hideDoneItems}
        items={items}
        darkMode={darkMode}
        setItems={setItems}
        onSelect={handleSelect}
      />
      <Box
        sx={{
          zIndex: 1000,
          display: { xs: 'flex', sm: 'none' }, // スマホサイズでのみ表示
          position: 'fixed',
          bottom: 20,
          left: 80,
          width: '100%',
          justifyContent: 'left',
        }}
      >
        <Button variant='contained' color='primary' startIcon={<AddIcon />} sx={{ width: '40%' }} onClick={handleAddTask}>
          タスク追加
        </Button>
      </Box>
    </Box>
  );
}

export default App;
