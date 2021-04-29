import { app, BrowserWindow } from 'electron';
import getWindow from './core/getAppWindow';
import setupHandlers from './core/setupHandlers';
import registerShortcuts from './core/registerShortcuts';
import { setupWindowLoop } from './core/windowSetup';

app.whenReady().then(() => {
  setupHandlers();
  const window = getWindow();
  window.moveTop();
  registerShortcuts();
  setupWindowLoop();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const window = getWindow();
      window.moveTop();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});