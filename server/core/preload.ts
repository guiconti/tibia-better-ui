import { ipcRenderer } from 'electron';
import { events } from '../constants';

window.addEventListener('DOMContentLoaded', async () => {

  const resizeBody = ({ width, height }: { width: number, height: number }) => {
    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
  };

  const startupInvokers = async () => {
    const { width, height } = await ipcRenderer.invoke(events.WINDOW_RESIZE);
    resizeBody({ width, height });
  }

  // Electron listeners
  ipcRenderer.on(events.WINDOW_RESIZE, (_event, { width, height }) => {
    resizeBody({ width, height });
  });

  startupInvokers();

  const a = await ipcRenderer.invoke('perform-action');
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    // replaceText(`${type}-version`, process.versions[type])
    replaceText(`${type}-version`, a);
  }
})