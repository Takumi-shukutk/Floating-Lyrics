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
  - [spotify.com](https://www.spotify.com) で作成
  - **Spotify Premium アカウントが必要です**

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

## ステップ 3: Electron アプリを起動

```bash
npm start
```

このコマンドで Electron が起動し、ローカルメタデータサーバーが `http://127.0.0.1:8889` で待機します。

## ステップ 4: Spicetify 拡張のセットアップ

Spicetify から再生中の曲情報を Electron に送信することで、Spotify Web API に依存せず歌詞表示を行います。

### 4.1 Spicetify 拡張スクリプト例

```js
class FloatingLyricsBridge {
  constructor() {
    this.interval = null;
  }

  onEnabled() {
    this.interval = setInterval(() => this.sendTrackInfo(), 500);
  }

  onDisabled() {
    clearInterval(this.interval);
  }

  sendTrackInfo() {
    const track = Spicetify.Player.data.track;
    if (!track) return;

    const payload = {
      name: track.name,
      artist: track.artist?.map(a => a.name).join(', ') || '',
      progress: Spicetify.Player.getProgress() || 0,
      duration: track.duration || 0,
      isPlaying: Spicetify.Player.isPlaying(),
      id: track.uri || null,
    };

    fetch('http://127.0.0.1:8889/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Electron アプリが起動していないときは無視
    });
  }
}

new FloatingLyricsBridge();
```

### 4.2 Spicetify に拡張を登録

- Spicetify の設定にこの拡張を追加
- Spotify を再起動して拡張を有効にする

### 4.3 動作確認

1. Electron アプリを起動
2. Spotify で曲を再生
3. Floating Lyrics に曲名と歌詞が表示されるか確認

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
