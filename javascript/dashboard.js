// Im not really sure who to properly setup an electron app,
// but this is basically going to be the root of the app.
// 🦀🦀🦀

const {
    Wave
} = require("./modules/Wave.js");

class Dashboard {
    constructor() {
        const waves = [
            new Wave("wave-landing", 0.5, 0.3, "#FFFFFF"),
        ];
    }
}

module.exports.Dashboard = Dashboard;