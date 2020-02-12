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
    dashboard.endDatabaseConnection();
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


  document.getElementById("form-dashboard-setup").addEventListener("submit", event => {
    const apikey = document.forms["dashboard-setup"].apikey.value;
    const stock = document.forms["dashboard-setup"].stock.value;
    const frequency = parseInt(document.forms["dashboard-setup"].frequency.value);

    if (!dashboard.setup) {
      dashboard.jumpstart(apikey, stock, frequency);

      if (showDatabaseSetup) {
        const host = document.forms["dashboard-setup"].host.value;
        const port = document.forms["dashboard-setup"].port.value;
        const user = document.forms["dashboard-setup"].user.value;
        const password = document.forms["dashboard-setup"].password.value;
        const database = document.forms["dashboard-setup"].database.value;

        dashboard.connectToDatabase(host, port, user, password, database);
      }
    }

    if (dashboard.setup) {
      document.getElementById("startup").style.display = "none";
      document.getElementById("dashboard").style.display = "grid";
    }

    event.preventDefault();
  });
});