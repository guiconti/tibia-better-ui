import { globalShortcut } from 'electron';
import getWindow from './getAppWindow';

export default async () => {
  const window = getWindow();
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    window.reload();
  })
}