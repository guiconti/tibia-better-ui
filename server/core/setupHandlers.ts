import { ipcMain } from 'electron';
import getActiveWindow from 'active-win';
import fs from 'fs';
import path from 'path'
import { events } from '../constants';

export default async () => {

  ipcMain.handle(events.WINDOW_RESIZE, async () => {
    const activeWindow = await getActiveWindow();
    if (!activeWindow) {
      return null;
    }
    const { width, height } = activeWindow.bounds;
    return { width, height };
  });

  ipcMain.handle(events.GET_PREFERENCES, () => {
    const preferencesText = fs.readFileSync(path.join(__dirname, '../../preferences.json'), 'utf-8');
    const preferences = JSON.parse(preferencesText);
    return { ...preferences };
  });
};
