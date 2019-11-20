const remote = require('electron').remote;

const {
  Dashboard
} = require("./js/dashboard");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  document.getElementById("close-btn").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.close();
  });

  document.getElementById("min-btn").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  });

  const dashboard = new Dashboard();
  dashboard.run();
})