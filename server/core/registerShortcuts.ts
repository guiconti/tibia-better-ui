import { globalShortcut } from 'electron';
import getWindow from './getAppWindow';
import { resizeWindow } from './windowSetup';
// import { events } from '../constants'; 

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
}