import { useEffect, useCallback, useState } from 'react';
import { TreeItem, AppState } from '../Tree/types'; // 必要な型をインポート
import { initialItems } from '../Tree/mock'; // 初期状態をインポート
import { isValidAppState } from '../Tree/utilities'; // 状態の検証関数をインポート
import { googleLogout } from '@react-oauth/google'; // Googleログアウト関数をインポート

export const useAppStateSync = (
  items: TreeItem[],
  setItems: React.Dispatch<React.SetStateAction<TreeItem[]>>,
  hideDoneItems: boolean,
  setHideDoneItems: React.Dispatch<React.SetStateAction<boolean>>,
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
  token: string | null,
  setToken: React.Dispatch<React.SetStateAction<string | null>>,
  isLoggedIn: boolean,
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMessage: React.Dispatch<React.SetStateAction<string | null>>,
  lastUpdated: Date | null,
  setLastUpdated: React.Dispatch<React.SetStateAction<Date>>
) => {
  // ポーリングによって状態が更新されたかどうかを示すフラグ
  const [isLoadedFromExternal, setIsLoadedFromExternal] = useState(false);

  // 状態の読み込み
  useEffect(() => {
    if (isLoggedIn && token) {
      const fetchAndSetAppState = async () => {
        if (!isLoggedIn || !token) return;
        try {
          const fileName = 'TaskTree.json';
          const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id, modifiedTime)`, {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${token}` }),
          });
          if (!searchResponse.ok) {
            throw new Error('セッションがタイムアウトしました。再度ログインを行ってください。');
          }
          const { files } = await searchResponse.json();
          const file = files.length > 0 ? files[0] : null;

          if (file) {
            const fileModifiedTime = new Date(file.modifiedTime);
            if (!lastUpdated || (fileModifiedTime.getTime() - lastUpdated.getTime()) > 3000) {
              if (setIsLoading) setIsLoading(true);
              const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                method: 'GET',
                headers: new Headers({ Authorization: `Bearer ${token}` }),
              });
              const appState: AppState = await fileResponse.json();

              if (isValidAppState(appState)) {
                setItems(appState.items);
                setHideDoneItems(appState.hideDoneItems);
                setDarkMode(appState.darkMode);
                setLastUpdated(fileModifiedTime);
                setIsLoadedFromExternal(true);
              }
              if (setIsLoading) setIsLoading(false);
            }
          } else {
            setItems(initialItems);
            if (setIsLoading) setIsLoading(false);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            setMessage('ログアウトしました。 : ' + error.message);
          } else {
            setMessage('ログアウトしました。セッションがタイムアウトしました。');
          }
          setLastUpdated(new Date(0));
          setItems([]);
          googleLogout();
          setIsLoggedIn(false);
          setToken(null);
        }
      };

      fetchAndSetAppState();

      // ポーリングを開始
      const interval = setInterval(fetchAndSetAppState, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token, setDarkMode, setHideDoneItems, setIsLoading, setItems, lastUpdated, setLastUpdated]);


  // 状態の保存
  // Google DriveからファイルIDを検索する関数
  const getFileIdByName = useCallback(async (token: string, fileName: string) => {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`, {
        method: 'GET',
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      });
      if (!response.ok) {
        throw new Error('セッションがタイムアウトしました。');
      }
      const result = await response.json();
      return result.files.length > 0 ? result.files[0].id : null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('予期せぬエラーが発生しました。');
      }
    }
  }, []);

  // Google Driveに状態を保存する関数（同名のファイルを上書き）
  const saveOrUpdateAppStateToGoogleDrive = useCallback((token: string, appStateJSON: string) => {
    return new Promise((resolve, reject) => {
      (async () => {
        // 条件チェックを追加
        const appState = JSON.parse(appStateJSON);

        if (!isValidAppState(appState)) {
          reject(new Error('GoogleDriveに保存する状態が指定された条件を満たしていません。'));
          return;
        }

        const fileName = 'TaskTree.json';
        let fileId;
        try {
          fileId = await getFileIdByName(token, fileName);
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error.message);
          } else {
            throw new Error('予期せぬエラーが発生しました。');
          }
        }

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
        try {
          const response = await fetch(url, {
            method: method,
            headers: new Headers({ Authorization: `Bearer ${token}` }),
            body: form,
          });
          if (!response.ok) {
            throw new Error('セッションがタイムアウトしました。');
          }
          resolve(response.json());
        } catch (error) {
          if (error instanceof Error) {
            reject(error.message);
          } else {
            throw new Error('予期せぬエラーが発生しました。');
          }
        }
      })().then(resolve).catch(reject);
    });
  }, [getFileIdByName]);

  // 状態が変更されたとき（例: アイテムの追加、完了タスクの表示/非表示の切り替え、ダークモードの切り替え）にGoogle Driveに状態を保存
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      if (token && !isLoadedFromExternal && !items) {
        const appState = { items, hideDoneItems, darkMode };
        const appStateJSON = JSON.stringify(appState);
        saveOrUpdateAppStateToGoogleDrive(token, appStateJSON)
          .then(() => {
            setLastUpdated(new Date());
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              setMessage('ログアウトしました。 : ' + error.message);
            } else {
              setMessage('ログアウトしました。セッションがタイムアウトしました。再度ログインを行ってください。');
            }
            setLastUpdated(new Date(0));
            setItems([]);
            googleLogout();
            setIsLoggedIn(false);
            setToken(null);
          });
      } else if (token && isLoadedFromExternal) {
        setIsLoadedFromExternal(false);
      }
    }, 3000); // 3秒のデバウンス

    return () => clearTimeout(debounceSave); // コンポーネントがアンマウントされるか、依存配列の値が変更された場合にタイマーをクリア
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hideDoneItems, darkMode, token, saveOrUpdateAppStateToGoogleDrive, isLoadedFromExternal, setIsLoggedIn]);
};

export default useAppStateSync;