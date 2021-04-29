import { BrowserWindow } from 'electron';
import path from 'path';

let win: BrowserWindow;

export default function getWindow(): BrowserWindow {
  if (win) {
    return win;
  }
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
    },
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    focusable: false,
  });
  win.setIgnoreMouseEvents(true);
  win.loadFile('../index.html');
  return win;
}