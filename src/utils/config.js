// ウィンドウのデフォルト設定
module.exports = {
  window: {
    // ウィンドウの初期サイズ
    width: 800,
    height: 200,
    
    // ウィンドウの初期位置（左上）
    x: 0,
    y: 0,
    
    // 常に最前列に表示
    alwaysOnTop: true,
    
    // 背景を透明にする
    transparent: true,
    
    // ウィンドウフレームなし
    frame: false,
    
    // タスクバーに表示しない
    skipTaskbar: true,
  },

  // 歌詞更新間隔（ミリ秒）
  updateInterval: 500,

  // UI設定
  ui: {
    // フォントファミリー
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    
    // 現在行の色
    currentLineColor: '#00d4ff',
    
    // 次の行の色
    nextLineColor: '#ffffff',
    
    // 背景の透明度（0-1）
    backgroundColor: 0.3,
  },

  // API設定
  api: {
    // Spotify API タイムアウト（ミリ秒）
    spotifyTimeout: 5000,
    
    // 歌詞API タイムアウト（ミリ秒）
    lyricsTimeout: 5000,
  },

  // キャッシュ設定
  cache: {
    // キャッシュサイズ（最大項目数）
    maxSize: 100,
    
    // キャッシュ有効期限（ミリ秒）
    ttl: 24 * 60 * 60 * 1000, // 24時間
  },
};
