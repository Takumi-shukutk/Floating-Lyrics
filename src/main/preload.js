const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCurrentTrackLyrics: () => ipcRenderer.invoke('get-current-track-lyrics'),
  onUpdateLyrics: (callback) => ipcRenderer.on('update-lyrics', callback),
  
  // ウィンドウ操作
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  toggleAlwaysOnTop: (enabled) => ipcRenderer.invoke('toggle-always-on-top', enabled),
  setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', x, y),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', width, height),
});
