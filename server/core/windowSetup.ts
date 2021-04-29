import getActiveWindow from 'active-win';
import getWindow from './getAppWindow';
import { events } from '../constants';

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

interface bounds {
  width: number;
  height: number;
  x: number;
  y: number;
};

export const resizeWindow = async ({ width, height, x, y }: bounds) => {
  const window = getWindow();
  const [currentWidth, currentHeight] = window.getSize();
  if (currentWidth !== width || currentHeight !== height) {
    window.setContentSize(width, height);
    window.webContents.send(events.WINDOW_RESIZE, { width, height });
  }
  const [currentX, currentY] = window.getPosition();
  if (currentX !== x || currentY !== y) {
    window.setPosition(x, y);
  }
};

const setupWindow = async () => {
  return new Promise<void>(async (resolve, reject) => {
    const window = getWindow();
    if (!window) {
      return reject('Failed on get window');
    }
    const activeWindow = await getActiveWindow();
    if (!activeWindow) {
      return reject('Failed on get active window.');
    }
    // if (activeWindow.title !== 'Tibia') {
    //   if (window.isVisible()) {
    //     window.hide();
    //   }
    //   return resolve();
    // }
    // if (!window.isVisible()) {
    //   window.show();
    //   window.moveTop();
    // }
    const { width, height, x, y } = activeWindow.bounds;
    resizeWindow({width, height, x, y});
    return resolve();
  });
};

export const setupWindowLoop = async () => {
  try {
    await setupWindow();
  } catch (err) {
    console.log(err);
  }
  await sleep(100);
  setupWindowLoop();
}