# トラブルシューティング

## よくある問題と解決策

### 1. 歌詞が表示されない

#### 症状
- ウィンドウには「歌詞を読み込み中...」と表示される
- 曲を再生しても歌詞が出ない

#### 原因
- Spotify が起動していない、または音楽を再生していない
- 歌詞 API に接続できない
- 曲の歌詞がデータベースにない

#### 解決策

1. **Spotify アプリを確認**
   ```
   ✓ Spotify Desktop または Spotify Web が起動している
   ✓ 音楽を再生している（「再生中」と表示されている）
   ✓ 曲を一度スキップしてから再度再生
   ```

2. **ネットワーク接続を確認**
   ```bash
   # ターミナルで以下を実行
   ping lyrics.ovh
   ping api.spotify.com
   ```
   応答がない場合は、ファイアウォール設定を確認

3. **ファイアウォール設定を確認**
   - Windows Defender ファイアウォール設定で Electron を許可

4. **別の曲で試す**
   - 人気のある曲（例: Adele - "Rolling in the Deep"）で試す
   - マイナーな曲は歌詞データベースにない場合もあります

5. **開発者ツールでエラーを確認**
   ```
   アプリ起動時に F12 キーを押す（開発モードで起動した場合）
   コンソールタブでエラーメッセージを確認
   ```

---

### 2. Spotify 認証エラー

#### 症状
- 「Client ID is not defined」
- 「SPOTIFY_CLIENT_SECRET is not defined」
- ターミナルに認証エラーが表示される

#### 原因
- `.env` ファイルが作成されていない
- `.env` ファイルの情報が間違っている
- `.env` ファイルが `Floating-Lyrics` フォルダ直下にない

#### 解決策

1. **`.env` ファイルを確認**
   ```bash
   # Floating-Lyrics フォルダで以下を実行
   dir .env
   # または
   ls -la .env
   ```
   `No such file` が表示される場合は、ファイルが存在していません

2. **`.env` ファイルを作成し直す**
   ```bash
   # Floating-Lyrics フォルダで以下を実行
   copy .env.example .env
   # または
   cp .env.example .env
   ```

3. **`.env` ファイルの内容を確認**
   ```
   テキストエディタで .env を開く
   ✓ SPOTIFY_CLIENT_ID に値が入っているか
   ✓ SPOTIFY_CLIENT_SECRET に値が入っているか
   ✓ SPOTIFY_REDIRECT_URI が正しいか（http://localhost:8888/callback）
   ```

4. **Spotify Developer ダッシュボードで確認**
   - [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Client ID と Secret が正しく `.env` に入力されているか再確認

5. **ファイルの文字コードを確認**
   ```
   テキストエディタで .env を再度開く
   保存時に「UTF-8」を選択して保存
   ```

---

### 3. セットアップ認証スクリプトがタイムアウト

#### 症状
- `npm run setup-auth` 実行後、ブラウザが開かない
- ターミナルに「タイムアウト」と表示される

#### 原因
- ブラウザが自動的に開かなかった
- ネットワーク接続がない
- Spotify にログインできない

#### 解決策

1. **URL を手動でコピー**
   ```
   ターミナルに表示された URL をコピー
   ブラウザのアドレスバーにペースト
   Enter キーを押す
   ```

2. **Spotify にログイン**
   ```
   メールアドレスとパスワードを入力
   「Log in」をクリック
   ```

3. **権限を許可**
   ```
   「Allow」または「確認」をクリック
   ```

4. **ブラウザがリダイレクト**
   ```
   「✅ Spotify認証成功！」と表示されたら完了
   ブラウザを閉じる
   ターミナルで「✅ 認証成功！」を確認
   ```

5. **再度試す場合**
   ```bash
   npm run setup-auth
   ```

---

### 4. ウィンドウが見えない

#### 症状
- アプリを起動してもウィンドウが表示されない
- ウィンドウがタスクバーに表示されない

#### 原因
- ウィンドウが画面外に移動している
- ウィンドウが透明度100%で見えない
- ウィンドウがデュアルモニタ設定で見えない位置にある

#### 解決策

1. **タスクバーでアプリを探す**
   ```
   タスクバー下部を確認
   Electron または Floating Lyrics のアイコンを探す
   ```

2. **ウィンドウをリセット**
   - `src/utils/config.js` を編集
   - `window.x` と `window.y` を `0` に設定
   ```javascript
   x: 0,
   y: 0,
   ```
   - ファイルを保存して `npm start` を実行

3. **デュアルモニタを確認**
   - セカンダリーモニタに表示されている可能性
   - プライマリーモニタにウィンドウをドラッグして戻す

---

### 5. npm install がエラーで失敗

#### 症状
```
npm ERR! ... gyp ERR! ...
npm ERR! code ... command failed
```

#### 原因
- Node.js のバージョンが低い
- ビルドツールがインストールされていない（Windows）

#### 解決策

1. **Node.js をアップグレード**
   ```bash
   # 現在のバージョンを確認
   node --version
   
   # 14.0 以上が必要
   # [nodejs.org](https://nodejs.org/) から最新版をダウンロード
   ```

2. **Windows: ビルドツールをインストール**
   ```bash
   npm install --global windows-build-tools
   ```

3. **npm キャッシュをクリア**
   ```bash
   npm cache clean --force
   npm install
   ```

---

### 6. 「npm start」で electron not found エラー

#### 症状
```
electron: command not found
または
'electron' is not recognized
```

#### 原因
- `npm install` が完了していない
- `node_modules` が削除されている

#### 解決策

```bash
# Floating-Lyrics フォルダで以下を実行
rm -rf node_modules package-lock.json
npm install

# その後
npm start
```

---

### 7. 歌詞は表示されるが、スクロール速度がおかしい

#### 症状
- 歌詞が速すぎる、または遅すぎる
- 歌詞の行が飛ぶ

#### 原因
- 歌詞の行数と曲の長さが合致していない
- Spotify API の時間情報が正確でない

#### 解決策

`src/renderer/index.js` の以下の部分を調整：

```javascript
function calculateCurrentLineIndex(progress, duration) {
  if (currentLyricsLines.length === 0) return -1;

  // 「lineCount」を調整してスクロール速度を変更
  const lineCount = currentLyricsLines.length;
  const progressPercent = duration > 0 ? progress / duration : 0;
  const index = Math.floor(progressPercent * lineCount);

  return Math.min(index, lineCount - 1);
}
```

---

### 8. 歌詞 API キーが設定されている

#### 症状
- Musixmatch または Genius API キーを設定したい
- より多くの曲の歌詞を取得したい

#### 解決策

1. **API キーを取得**
   - [Musixmatch API](https://www.musixmatch.com/settings/account)
   - [Genius API](https://genius.com/api-clients)

2. **`.env` ファイルに追加**
   ```env
   MUSIXMATCH_API_KEY=your_api_key_here
   GENIUS_API_KEY=your_api_key_here
   ```

3. **アプリを再起動**
   ```bash
   npm start
   ```

---

### 9. ウィンドウをカスタマイズしたい

#### 外観を変更
- `src/renderer/index.css` を編集
- フォント、色、サイズを変更可能

#### 動作を変更
- `src/renderer/index.js` を編集
- 歌詞表示ロジックを変更可能

#### ウィンドウサイズを変更
- `src/utils/config.js` を編集：
  ```javascript
  width: 1000,   // ウィンドウ幅
  height: 300,   // ウィンドウ高さ
  ```

---

## さらなるサポート

問題が解決しない場合は、以下を確認してください：

1. **コンソールエラーを確認**
   ```bash
   アプリを開発モードで起動
   npm run dev
   
   F12 キーで開発者ツールを開く
   コンソールタブでエラーを確認
   ```

2. **GitHub Issues で検索**
   - [Floating-Lyrics Issues](https://github.com/yourusername/Floating-Lyrics/issues)
   - 同じ問題が報告されているか確認

3. **ログを確認**
   - Floating-Lyrics フォルダに `.spotify-cache` ファイルがあるか確認
   - ファイルがない場合は認証が完了していません

---

## 情報提供いただきたい場合

GitHub Issues を作成する際、以下の情報があると助かります：

- OS（Windows 10/11, macOS, Linux のバージョン）
- Node.js バージョン: `node --version`
- npm バージョン: `npm --version`
- エラーメッセージ全文
- 操作手順（再現方法）
- 開発者ツール（F12）のコンソール出力
