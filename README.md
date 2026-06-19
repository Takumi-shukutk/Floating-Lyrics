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
- **Spicetify** を導入した Spotify 環境
- **Spicetify 拡張をインストールできる環境**

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

### 3. アプリケーションの起動

```bash
npm start
```

アプリを起動すると、ローカルのメタデータ受信サーバーが `http://127.0.0.1:8889` で待機します。

### 4. Spicetify 拡張をセットアップ

1. Spicetify の拡張スクリプトを用意します。
2. Spicetify から再生中の曲情報を `http://127.0.0.1:8889/track` に POST 送信します。
3. Electron アプリが受信した曲情報をもとに歌詞を検索・表示します。

## Spicetify 拡張例

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

 ⚠️ これにより、Spotify Premium は不要になります。

## 5. 使い方

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