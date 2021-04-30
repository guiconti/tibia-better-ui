import { ipcRenderer } from 'electron';
import { events } from '../constants';

window.addEventListener('DOMContentLoaded', async () => {
  const cooldownsLeft = document.querySelector('.cooldowns__left');
  const cooldownsRight = document.querySelector('.cooldowns__right');

  if (!cooldownsLeft || !cooldownsRight) {
    console.error('Wrong HTML file');
  }

  const cooldowns = {
    [events.ITEM_COOLDOWN]: {
      active: false,
      timer: 1000,
      side: 'left',
      color: 'yellow',
    },
    [events.ATTACK_COOLDOWN]: {
      active: false,
      timer: 2000,
      side: 'right',
      color: 'red',
    },
    [events.HEALING_COOLDOWN]: {
      active: false,
      timer: 1000,
      side: 'left',
      color: 'green',
    },
    [events.SUPPORT_COOLDOWN]: {
      active: false,
      timer: 2000,
      side: 'right',
      color: 'purple',
    },
  };

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

    const { colors } = await ipcRenderer.invoke(events.GET_PREFERENCES);
    if (!colors) {
      return;
    }
    Object.keys(colors).forEach(cooldown => {
      cooldowns[cooldown].color = colors[cooldown];
    });
  };

  const arcGenerator = (side: string = 'left', color: string = 'red') => {
    const arc = document.createElement('div');
    arc.className += `arc arc__${side}`;
    const arcFilled = document.createElement('div');
    arcFilled.className += `arc__${side} arc--progress`;
    arcFilled.style.backgroundColor = color;
    arc.append(arcFilled);
    return {
      arc,
      arcFilled,
    };
  };

  const cooldownGenerator = async (timer: number = 1000, side: string = 'left', color: string = 'red') => {
    return new Promise<void>(async (resolve) => {
      const ticks = 100;
      let currentCooldown = 100;
      const { arc, arcFilled } = arcGenerator(side, color);
      const selectedCooldown = side === 'left' ? cooldownsLeft : cooldownsRight;
      selectedCooldown?.append(arc);
      while (currentCooldown > 0) {
        arcFilled.style.height = `${currentCooldown}%`;
        await sleep(timer / ticks);
        currentCooldown -= 100 / ticks;
      }
      arcFilled.style.height = `${currentCooldown}%`;
      selectedCooldown?.removeChild(arc);
      return resolve();
    });
  };

  const startCooldown = async (event: string, hotkey: string, registerKey: boolean = true) => {
    return new Promise<void>(async (resolve) => {
      if (!cooldowns[event]) {
        return;
      }
      if (cooldowns[event].active) {
        return;
      }
      cooldowns[event].active = true;
      await cooldownGenerator(cooldowns[event].timer, cooldowns[event].side, cooldowns[event].color);
      if (registerKey) {
        ipcRenderer.invoke(events.REGISTER_HOTKEY, event, hotkey);
      }
      cooldowns[event].active = false;
      return resolve();
    });
  };

  // TODO: Implement item buffer
  const itemCooldown = async (_event: any, hotkey: string, registerKey: boolean = true) => {
    return new Promise<void>(async (resolve) => {
      await startCooldown(events.ITEM_COOLDOWN, hotkey, registerKey);
      return resolve();
    });
  };

  const attackCooldown = async (_event: any, hotkey: string, registerKey: boolean = true) => {
    return new Promise<void>(async (resolve) => {
      await startCooldown(events.ATTACK_COOLDOWN, hotkey, registerKey);
      return resolve();
    });
  };

  const healingCooldown = async (_event: any, hotkey: string, registerKey: boolean = true) => {
    return new Promise<void>(async (resolve) => {
      await startCooldown(events.HEALING_COOLDOWN, hotkey, registerKey);
      return resolve();
    });
  };

  const supportCooldown = async (_event: any, hotkey: string, registerKey: boolean = true) => {
    return new Promise<void>(async (resolve) => {
      await startCooldown(events.SUPPORT_COOLDOWN, hotkey, registerKey);
      return resolve();
    });
  };

  const attackRuneCooldown = async (_event: any, hotkey: string) => {
    return new Promise<void>(async (resolve) => {
      itemCooldown(_event, hotkey, false);
      await attackCooldown(_event, hotkey, false);
      ipcRenderer.invoke(events.REGISTER_HOTKEY, events.ATTACK_RUNE_COOLDOWN, hotkey);
      return resolve();
    });
  };

  const healingRuneCooldown = async (_event: any, hotkey: string) => {
    return new Promise<void>(async (resolve) => {
      itemCooldown(_event, hotkey, false);
      await healingCooldown(_event, hotkey, false);
      ipcRenderer.invoke(events.REGISTER_HOTKEY, events.HEALING_RUNE_COOLDOWN, hotkey);
      return resolve();
    });
  };

  const supportRuneCooldown = async (_event: any, hotkey: string) => {
    return new Promise<void>(async (resolve) => {
      itemCooldown(_event, hotkey, false);
      await supportCooldown(_event, hotkey, false);
      ipcRenderer.invoke(events.REGISTER_HOTKEY, events.SUPPORT_RUNE_COOLDOWN, hotkey);
      return resolve();
    });
  };

  // Electron listeners
  ipcRenderer.on(events.WINDOW_RESIZE, (_event, { width, height }) => {
    resizeBody({ width, height });
  });
  ipcRenderer.on(events.ITEM_COOLDOWN, itemCooldown);
  ipcRenderer.on(events.ATTACK_COOLDOWN, attackCooldown);
  ipcRenderer.on(events.HEALING_COOLDOWN, healingCooldown);
  ipcRenderer.on(events.SUPPORT_COOLDOWN, supportCooldown);
  ipcRenderer.on(events.ATTACK_RUNE_COOLDOWN, attackRuneCooldown);
  ipcRenderer.on(events.HEALING_RUNE_COOLDOWN, healingRuneCooldown);
  ipcRenderer.on(events.SUPPORT_RUNE_COOLDOWN, supportRuneCooldown);

  startupInvokers();
});
