const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', async () => {

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