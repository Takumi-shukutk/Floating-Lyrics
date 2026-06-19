# Floating-Lyrics

🎵 ゲーム中でもSpotifyの歌詞をリアルタイム表示するElectron オーバーレイアプリ

## 機能

- ✨ **透明背景のオーバーレイウィンドウ** - ゲーム画面を邪魔しない設計
- 🎯 **リアルタイム歌詞スクロール表示** - 現在行を中央に表示
- 🎨 **自動色反転** - 背景の明るさに応じて文字色が自動切り替わり
- 📌 **常時最前列** - ゲーム中でも常に歌詞が見える
- 🖱️ **ドラッグ移動** - ウィンドウ位置を自由に変更可能
- 🔄 **複数の歌詞API対応** - Lyrics.ovh（無料）、Musixmatch、Genius

## 必要なもの

- **Node.js** 14.0 以上
- **Spotify** のアカウント（フリープランOK）
- **Spotify Developer** アプリケーション（API認証用）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/Floating-Lyrics.git
cd Floating-Lyrics
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Spotify Developer アプリケーション作成

#### 3.1 Spotify Developer アカウント作成
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) にアクセス
2. Spotifyアカウントでログイン（なければ作成）
3. 利用規約に同意して「CREATE AN APP」をクリック

#### 3.2 アプリケーション情報の取得
1. アプリ名を入力（例: "Floating Lyrics"）
2. 利用規約に同意してアプリを作成
3. アプリの詳細ページで以下を確認：
   - **Client ID** 📋
   - **Client Secret** 🔐（表示するには「Show Client Secret」をクリック）

#### 3.3 Redirect URIの設定
1. アプリ設定ページの「Edit Settings」をクリック
2. **Redirect URIs** セクションで `http://127.0.0.1:8888/callback` を追加
3. **Save** をクリック

### 4. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、Spotify情報を入力：

```env
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

⚠️ **重要**: `.env` ファイルは `.gitignore` に含まれています。**絶対に git にコミットしないでください。**

### 5. アプリケーションの起動

```bash
npm start
```

初回起動時は、Spotify認証が必要です。ブラウザが自動的に開き、Spotifyでのログインと権限許可を求められます。

## 使い方

### ウィンドウ操作

- **タイトルバードラッグ** - ウィンドウを移動
- **📌 ボタン** - 常時最前列の ON/OFF
- **➖ ボタン** - ウィンドウを最小化
- **✕ ボタン** - アプリを終了

### 歌詞表示のカスタマイズ

`src/renderer/index.css` を編集して、フォントサイズや色を変更可能：

```css
.lyrics-line.current {
  font-size: 24px;
  color: #00d4ff;  /* 現在行の色 */
}
```

## トラブルシューティング

### 歌詞が表示されない

1. **Spotifyが起動してるか確認** - Spotify Desktop/Webで音楽を再生してください
2. **ネット接続確認** - 歌詞API（lyrics.ovh）に接続してください
3. **コンソールを確認** - 開発者ツール（F12）でエラーメッセージを確認

### 認証エラー

1. **Client ID/Secret を確認** - `.env` ファイルをチェック
2. **Redirect URI を確認** - Spotify Developer ダッシュボードの設定と一致しているか
3. **キャッシュを削除** - `.spotify-cache` ファイルを削除して再試行

### ウィンドウが見えない

- Windows の場合、タスクバーを確認してアプリ（浮かぶウィンドウ）を探してください
- ウィンドウを右クリックして「ウィンドウを表示」を選択

## 開発モード

開発時はホットリロード付きで起動：

```bash
npm run dev
```

（フロントエンド開発用に別途webpack-dev-serverが必要な場合もあります）

## ビルド

Windows用の実行ファイルを作成：

```bash
npm run build-win
```

生成されたファイルは `dist/` ディレクトリに保存されます。

## ライセンス

MIT

## 貢献

プルリクエスト・Issue報告を大歓迎です！

## 注意事項

- このアプリは個人使用を想定しています
- Spotify API の利用規約に従ってください
- 歌詞情報は各プロバイダーの利用規約に従います