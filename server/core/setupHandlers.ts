import { ipcMain } from 'electron';
import getActiveWindow from 'active-win';
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

  // ipcMain.handle('perform-action', (event, ...args) => {
  ipcMain.handle('perform-action', () => {
    // ... do actions on behalf of the Renderer
    return 1;
  });
};
