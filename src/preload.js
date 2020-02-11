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

  document.getElementById("btn-close").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.close();
  });

  document.getElementById("btn-min").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  });

  let showDatabaseSetup = false;
  document.getElementById("chbox-database").addEventListener("click", () => {
    showDatabaseSetup = !showDatabaseSetup;
    const databaseFields = document.getElementById("mysql-fields");
    if (showDatabaseSetup) {
      databaseFields.style.display = "block";
    } else {
      databaseFields.style.display = "none";
    }
  });

  const dashboard = new Dashboard();

  document.getElementById("btn-submit").addEventListener("click", () => {
    const apikey = document.getElementById("input-api-key").value;
    const stock = document.getElementById("input-stock").value;

    if (!dashboard.setup) {
      dashboard.jumpstart(apikey, stock);
    }

    if (dashboard.setup) {
      document.getElementById("startup").style.display = "none";
      document.getElementById("dashboard").style.display = "grid";
    }
  });
})