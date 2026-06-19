# Floating Lyrics - セットアップガイド

## 概要

このドキュメントは、Floating Lyrics を Windows で初回セットアップする手順です。

## ステップ 1: 前提条件を確認

以下がインストールされているか確認してください：

- **Node.js 14.0 以上**
  - [公式サイト](https://nodejs.org/) からダウンロード
  - インストール後、ターミナルで以下を実行：
    ```bash
    node --version
    npm --version
    ```

- **Git** （リポジトリをクローンする場合）
  - [Git for Windows](https://git-scm.com/download/win) からダウンロード

- **Spotify アカウント**
  - [spotify.com](https://www.spotify.com) で作成（フリープランOK）

## ステップ 2: Floating Lyrics をセットアップ

### 2.1 リポジトリをクローン

```bash
git clone https://github.com/yourusername/Floating-Lyrics.git
cd Floating-Lyrics
```

または ZIP ファイルを解凍した場合、解凍フォルダに移動：

```bash
cd Floating-Lyrics
```

### 2.2 依存関係をインストール

```bash
npm install
```

⏳ **初回は 2-5 分かかります。完了まで待ってください。**

## ステップ 3: Spotify Developer アプリケーションを作成

このステップで、Spotify API の認証情報を取得します。

### 3.1 Spotify Developer アカウントにログイン

1. ブラウザで [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) を開く
2. **「Log in」** をクリック
3. Spotify アカウント（またはメールアドレス）でログイン
   - Spotify アカウントがない場合は、先に作成してください
   - フリープランで問題ありません

### 3.2 新しいアプリケーションを作成

1. ダッシュボード内の **「Create an App」** をクリック
2. アプリケーション名を入力
   - 例: `Floating Lyrics`
3. 利用規約に同意して **「Create」** をクリック

### 3.3 Client ID と Client Secret を取得

1. 作成したアプリケーションをクリック
2. 詳細ページで以下を確認：
   - **Client ID**: コピーして保管
   - **Client Secret**: 「Show Client Secret」をクリックしてコピー

⚠️ **Client Secret は絶対に他人に教えないでください！**

### 3.4 Redirect URI を設定

1. アプリケーション詳細ページで **「Edit Settings」** をクリック
2. **「Redirect URIs」** セクションを探す
3. 以下を入力：
   ```
   http://127.0.0.1:8888/callback
   ```
4. **「Add」** をクリック
5. **「Save」** をクリック

## ステップ 4: 環境変数を設定

### 4.1 .env ファイルを作成

Floating Lyrics フォルダ内で、`.env` ファイルを作成：

#### Windows (コマンドプロンプト)

```bash
copy .env.example .env
```

#### Windows (PowerShell) または macOS/Linux

```bash
cp .env.example .env
```

### 4.2 .env ファイルを編集

作成した `.env` ファイルをテキストエディタで開く（メモ帳など）：

```env
SPOTIFY_CLIENT_ID=「3.3で取得した Client ID」
SPOTIFY_CLIENT_SECRET=「3.3で取得した Client Secret」
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

例：

```env
SPOTIFY_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
SPOTIFY_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890abc
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

✅ **ファイルを保存してください。**

## ステップ 5: Spotify 認証を実行

Floating Lyrics フォルダで、ターミナルを開いて以下を実行：

```bash
npm run setup-auth
```

### 認証フロー

1. **ターミナルに認可 URL が表示される**
   ```
   📌 以下のURLをブラウザで開いてください:
   https://accounts.spotify.com/authorize?client_id=...
   ```

2. **URL をコピーしてブラウザで開く**
   - またはリンクをクリック

3. **Spotify にログイン**
   - Spotify のログイン画面が出ます
   - メールアドレスとパスワードを入力

4. **権限を許可**
   - 「確認」または「Allow」ボタンをクリック
   - Floating Lyrics が以下へのアクセスを要求します：
     - 再生中の曲情報を読む
     - 再生状態を読む

5. **ブラウザがリダイレクト**
   - 自動的に `http://localhost:8888/callback` にリダイレクト
   - ✅ Spotify認証成功！」と表示されます

6. **ターミナルで確認**
   - ターミナルに「✅ 認証成功！」と表示されれば完了

```
✅ 認証成功！
📁 トークンは .spotify-cache に保存されました。

🚀 次のコマンドでアプリを起動してください:
   npm start
```

## ステップ 6: アプリケーションを起動

Floating Lyrics フォルダで、ターミナルを開いて以下を実行：

```bash
npm start
```

✨ **Floating Lyrics ウィンドウが起動します！**

### 最初の起動確認

1. **Spotify を起動**
   - Spotify Desktop または Spotify Web で音楽を再生

2. **Floating Lyrics に歌詞が表示される**
   - 現在行が大きく表示される
   - スクロールして歌詞が流れる

3. **ウィンドウを移動**
   - タイトルバーをドラッグして移動可能

## トラブルシューティング

### 問題: ターミナルに認可 URL が表示されない

**原因**: `.env` ファイルの情報が間違っている

**解決策**:
1. `.env` ファイルを確認
2. Client ID と Client Secret が正しく入力されているか確認
3. Spotify Developer ダッシュボードで情報を再確認

### 問題: 「認証失敗」エラーが出た

**原因**: 
- Redirect URI が設定と異なる
- ネットワーク接続がない

**解決策**:
1. Spotify Developer ダッシュボードで Redirect URI を確認
   - `http://localhost:8888/callback` になっているか
2. ターミナルでエラーメッセージを確認
3. ネットワーク接続を確認

### 問題: 「SPOTIFY_CLIENT_ID is not defined」

**原因**: `.env` ファイルが作成されていない

**解決策**:
```bash
copy .env.example .env
```
を実行して `.env` ファイルを作成し直す

### 問題: アプリ起動時に「歌詞が見つかりません」

**原因**:
- Spotify で音楽を再生していない
- 歌詞API（lyrics.ovh）に接続できない

**解決策**:
1. Spotify を開いて曲を再生
2. ネットワーク接続を確認
3. ファイアウォール設定を確認

### 問題: ウィンドウが表示されない

**原因**: ウィンドウが画面外に移動した

**解決策**:
1. Windows タスクバーで「Floating Lyrics」を探す
2. アイコンを右クリック → ウィンドウを表示

## 次のステップ

- [README.md](../README.md) で使い方を確認
- アプリケーションをカスタマイズ
  - フォント、色、サイズを変更 → `src/renderer/index.css` を編集
  - 動作を変更 → `src/renderer/index.js` を編集

## 情報

- 📧 サポート: Issue を作成してください
- 📚 参考資料:
  - [Spotify Web API](https://developer.spotify.com/documentation/web-api)
  - [Electron Documentation](https://www.electronjs.org/docs)
  - [lyrics.ovh API](https://lyricsovh.docs.apiary.io/)
