import { app, BrowserWindow, ipcMain } from 'electron';
import getWindow from './core/getAppWindow';
import registerShortcuts from './core/registerShortcuts';

// ipcMain.handle('perform-action', (event, ...args) => {
ipcMain.handle('perform-action', () => {
  // ... do actions on behalf of the Renderer
  return 1;
});

app.whenReady().then(() => {
  getWindow();
  registerShortcuts();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      getWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});