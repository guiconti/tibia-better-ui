import { globalShortcut } from 'electron';
import fs from 'fs';
import path from 'path';
import getWindow from './getAppWindow';
import { resizeWindow } from './windowSetup';

export default async () => {
  const window = getWindow();
  globalShortcut.unregisterAll();
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    const [width, height] = window.getSize();
    const [x, y] = window.getPosition();
    window.reload();
    resizeWindow({width, height, x, y});
  });
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    window.webContents.toggleDevTools();
    window.setIgnoreMouseEvents(window.webContents.isDevToolsOpened());
  });
  globalShortcut.register('F12', () => {
    window.webContents.openDevTools();
  });
  const preferencesText = fs.readFileSync(path.join(__dirname, '../../preferences.json'), 'utf-8');
  const preferences = JSON.parse(preferencesText);
  Object.keys(preferences.hotkeys).forEach(hotkey => {
    for (const key in preferences.hotkeys[hotkey]) {
      if (globalShortcut.isRegistered(key)) {
        console.error('Duplicate hotkey error');
        return;
      }
    }
    globalShortcut.registerAll(preferences.hotkeys[hotkey], () => {
      window.webContents.send(hotkey);
    });
  });
}