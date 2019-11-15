// Im not really sure who to properly setup an electron app,
// but this is basically going to be the root of the app.
// 🦀🦀🦀

const {
    Price
} = require("./modules/price.js");

class Dashboard {
    constructor() {
        this.credentials = null;
        this.alphavantageKey = null;

        this.validTradingDay = true;
        this.date = null;
        this.parseDate();
        console.log(this.date);
        
        this.price = null;

        this.initialize().then(([credentials]) => {
            this.credentials = credentials;
            this.alphavantageKey = this.credentials["alphavantageKey"];
            //this.price = new Price(this.alphavantageKey);
        });
    }

    initialize() {
        return Promise.all([this.getCredentials()]);
    }

    async getCredentials() {
        const file = await fetch("testing_credentials.json");
        const json = await file.json();
        return json;
    }

    parseDate() {
        const date = new Date();
        this.verifyDate(date);
        this.formatDate(date);
    }

    verifyDate(date) {
        const dayOfTheWeek = date.toDateString().split(" ")[0];
        switch (dayOfTheWeek) {
            case "Mon":
                break;
            case "Tue":
                break;
            case "Wed":
                break;
            case "Thu":
                break;
            case "Fri":
                break;
            case "Sat":
                this.validTradingDay = false;
                break;
            case "Sun":
                this.validTradingDay = false;
                break;
        }
    }

    formatDate(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month < 10) {
            month = "0" + month;
        }        
        if (day < 10) {
            day = "0" + day;
        }
        this.date = `${year}-${month}-${day}`;
    }
}

module.exports.Dashboard = Dashboard;