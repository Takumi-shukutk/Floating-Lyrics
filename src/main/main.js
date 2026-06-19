const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TrackProvider = require('../services/trackProvider');
const MetadataServer = require('../services/metadataServer');
const LyricsService = require('../services/lyrics');
const config = require('../utils/config');

// GPUプロセスがクラッシュするケースへの対応
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

let mainWindow;
let trackProvider;
let metadataServer;
let lyricsService;
let updateInterval;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: config.window.width,
    height: config.window.height,
    x: config.window.x,
    y: config.window.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // 透明背景、常に最前列、フレームなし
    transparent: config.window.transparent,
    alwaysOnTop: config.window.alwaysOnTop,
    frame: config.window.frame,
    skipTaskbar: config.window.skipTaskbar,
  });

  if (config.window.alwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    if (typeof mainWindow.setVisibleOnAllWorkspaces === 'function') {
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
  }

  const isDev = process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// TrackProvider と Metadata Server の初期化
const initializeServices = async () => {
  trackProvider = new TrackProvider();
  metadataServer = new MetadataServer(trackProvider, 8889);
  lyricsService = new LyricsService();

  metadataServer.start();

  console.log('\n🔌 Spicetify からの再生情報を待機しています...');
  return true;
};

// IPC: 現在の曲情報と歌詞を取得
ipcMain.handle('get-current-track-lyrics', async () => {
  try {
    if (!trackProvider || !lyricsService) {
      return null;
    }

    const track = trackProvider.getCurrentTrack();
    if (!track) {
      return null;
    }

    console.log('Main process current track:', track);
    const lyrics = track.lyrics ? track.lyrics : await lyricsService.getLyrics(track.name, track.artist);

    return {
      trackName: track.name,
      artist: track.artist,
      progress: track.progress,
      duration: track.duration,
      isPlaying: track.isPlaying,
      lyrics: lyrics,
    };
  } catch (error) {
    console.error('歌詞取得エラー:', error);
    return null;
  }
});

// IPC: ウィンドウ操作
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('toggle-always-on-top', (event, enabled) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(enabled);
  }
});

ipcMain.handle('set-window-position', (event, x, y) => {
  if (mainWindow) {
    mainWindow.setPosition(x, y);
  }
});

ipcMain.handle('set-window-size', (event, width, height) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
  }
});

app.on('ready', async () => {
  const initialized = await initializeServices();
  if (!initialized) {
    app.quit();
    return;
  }

  createWindow();

  // リアルタイム更新
  updateInterval = setInterval(() => {
    if (mainWindow) {
      mainWindow.webContents.send('update-lyrics');
    }
  }, config.updateInterval);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    clearInterval(updateInterval);
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
