import { ipcRenderer } from 'electron';
import { events } from '../constants';

window.addEventListener('DOMContentLoaded', async () => {
  const cooldownsLeft = document.querySelector('.cooldowns__left');
  const cooldownsRight = document.querySelector('.cooldowns__right');

  if (!cooldownsLeft || !cooldownsRight) {
    console.error('Wrong HTML file');
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const resizeBody = ({ width, height }: { width: number, height: number }) => {
    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
  };

  const startupInvokers = async () => {
    const { width, height } = await ipcRenderer.invoke(events.WINDOW_RESIZE);
    resizeBody({ width, height });
  };

  const arcGenerator = (side: string = 'left') => {
    const arc = document.createElement('div');
    arc.className += `arc arc__${side}`;
    const arcFilled = document.createElement('div');
    arcFilled.className += `arc__${side} arc--progress`;
    arc.append(arcFilled);
    return {
      arc,
      arcFilled,
    };
  };

  const cooldownGenerator = async (timer: number = 1000, side: string = 'left') => {
    const ticks = 100;
    let currentCooldown = 100;
    const { arc, arcFilled } = arcGenerator(side);
    const selectedCooldown = side === 'left' ? cooldownsLeft : cooldownsRight;
    selectedCooldown?.append(arc);
    while (currentCooldown > 0) {
      arcFilled.style.height = `${currentCooldown}%`;
      await sleep(timer / ticks);
      currentCooldown -= 100 / ticks;
    }
    arcFilled.style.height = `${currentCooldown}%`;
    selectedCooldown?.removeChild(arc);
  };

  const potionCooldown = () => {
    cooldownGenerator(1000, 'left');
  };

  // Electron listeners
  ipcRenderer.on(events.WINDOW_RESIZE, (_event, { width, height }) => {
    resizeBody({ width, height });
  });
  
  ipcRenderer.on(events.POTION_COOLDOWN, potionCooldown);

  startupInvokers();
});
