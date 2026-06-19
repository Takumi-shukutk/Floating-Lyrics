# Floating Lyrics - セットアップガイド

## 概要
# Floating Lyrics - セットアップガイド

## 概要

このドキュメントは、Floating Lyrics を Windows/macOS/Linux で初回セットアップする手順です（Spicetify 経由で再生情報を渡す方式）。

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
  - [Git](https://git-scm.com/) をインストール

- **Spotify + Spicetify**
  - Spicetify が導入されている Spotify 環境

## ステップ 2: Floating Lyrics をセットアップ

### 2.1 リポジトリをクローン

```bash
git clone https://github.com/yourusername/Floating-Lyrics.git
cd Floating-Lyrics
```

### 2.2 依存関係をインストール

```bash
npm install
```

## ステップ 3: Electron アプリを起動

```bash
npm start
```

このコマンドで Electron が起動し、ローカルメタデータ受信サーバーが `http://127.0.0.1:8889` で待機します。

## ステップ 4: Spicetify 拡張のセットアップ

Spicetify から再生中の曲情報を Electron に送信するための手順です。

### 4.1 拡張ファイルの配置

Windows:

```powershell
spicetify config-dir
```
フォルダの中のExtensionsフォルダーに"Floating-Lyrics-main\spicetify-extensions\floating-lyrics-bridge.js"をコピーする
```
spicetify config extensions floating-lyrics-bridge.js
spicetify apply
```

Linux / macOS:

Sorry IDK.

### 4.2動作確認

1. start.batを実行
2. Spotify を再生
3. Floating Lyrics に曲名と歌詞が表示されるか確認

## トラブルシューティング

- Electron が受信していない場合、Spicetify 拡張が `http://127.0.0.1:8889/track` に POST 送信しているか確認してください。
- ファイアウォールでローカル接続がブロックされていないか確認してください。

## 次のステップ

- Spicetify 拡張をカスタマイズして、必要なメタデータを送信してください。
- 必要であれば、アプリ側に追加の受信ルート（例: WebSocket）を実装します。
      body: JSON.stringify(payload),
