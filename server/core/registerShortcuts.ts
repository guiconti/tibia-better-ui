import { globalShortcut } from 'electron';
import fs from 'fs';
import path from 'path';
import robot from 'robotjs';
import getWindow from './getAppWindow';
import { resizeWindow } from './windowSetup';
import { ipcMain } from 'electron';
import { events } from '../constants';

robot.setKeyboardDelay(0);

const registerKey = (event: string, hotkey: string, customCooldowns: object[] = []) => {
  if (globalShortcut.isRegistered(hotkey)) {
    console.error('Duplicate hotkey error');
    return;
  }
  const module = {
    event,
    hotkey,
    customCooldowns,
    registerFunction: async function() {
      if (!this) {
        return;
      }
      const window = getWindow();
      globalShortcut.unregister(this.hotkey);
      window.webContents.send(this.event, this.hotkey, this.customCooldowns);
      if (this.customCooldowns.length >= 0) {
        this.customCooldowns.forEach((customCooldown) => {
          window.webContents.send(events.CUSTOM_COOLDOWN, customCooldown);
        });
      }
      const adjustedKeys = this.hotkey.replace('CommandOrControl', 'control').toLowerCase();
      const keys = adjustedKeys.split('+');
      const key = keys[keys.length - 1];
      let modifiers = [];
      // keys.length - 1 because the last key is not a modifier
      for (let i = 0; i < keys.length - 1; i++) {
        modifiers.push(keys[i])
      }
      robot.keyTap(key, modifiers);
    },
  };
  globalShortcut.register(hotkey, module.registerFunction.bind(module));
};

// Called from webpage so we can reregister the hotkey after the event is done
ipcMain.handle(events.REGISTER_HOTKEY, async (_event, ...args) => {
  registerKey(args[0], args[1], args[2]);
});

export default async () => {
  const window = getWindow();
  globalShortcut.unregisterAll();
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    const [width, height] = window.getSize();
    const [x, y] = window.getPosition();
    window.reload();
    resizeWindow({ width, height, x, y });
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
  Object.keys(preferences.hotkeys).forEach(event => {
    for (const hotkey of preferences.hotkeys[event]) {
      registerKey(event, hotkey);
    }
  });
  Object.keys(preferences.customHotkeys).forEach(customHotkey => {
    for (const hotkey of preferences.customHotkeys[customHotkey].keys) {
      registerKey(
        preferences.customHotkeys[customHotkey].event,
        hotkey,
        preferences.customHotkeys[customHotkey].customCooldowns
      );
    }
  });
}