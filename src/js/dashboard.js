// Im not really sure who to properly setup an electron app,
// but this is basically going to be the root of the app.
// 🦀🦀🦀

const {
    PriceManager,
    MACDManager,
    RSIManager
} = require("./modules/managers");

class Dashboard {
    constructor() {
        this.credentials = null;
        this.alphavantageKey = null;

        this.validTradingDay = true;
        this.date = null;
        this.parseDate();

        this.updateFrequency = 15;
        this.targetStock = "SPY";
        this.shortEMAPeriod = 12 * 5;
        this.longEMAPeriod = 26 * 5;

        // Price Manager
        this.pricingData = Array(390).fill(undefined);
        this.volumeData = Array(390 / 5).fill(0);
        this.longEMAData = Array(390).fill(undefined);
        this.shortEMAData = Array(390).fill(undefined);
        this.vwapData = Array(390).fill(undefined);
        // MACD Manager
        this.macdData = Array(390 / 5).fill(undefined);
        this.macdSignalData = Array(390 / 5).fill(undefined);
        this.macdHistogramData = Array(390 / 5).fill(undefined);
        // RSI Manager
        this.rsiData = Array(390 / 5).fill(undefined);

        this.priceManager = new PriceManager(this.pricingData, this.volumeData, this.shortEMAData, this.longEMAData, this.vwapData);
        this.macdManager = new MACDManager(this.macdData, this.macdSignalData, this.macdHistogramData);
        this.rsiManager = new RSIManager(this.rsiData);

        this.setup = false;
    }

    run() {
        this.initialize();
        this.update();

        setInterval(() => {
            this.update();
        }, this.updateFrequency * 1000);
    }

    //#region Initialization

    initialize() {
        if (this.setup)
            return;

        this.initializeDashboard().then(([credentials]) => {
            this.credentials = credentials;
            this.alphavantageKey = this.credentials["alphavantageKey"];
            this.setup = true;
        });
    }

    initializeDashboard() {
        return Promise.all([this.getCredentials()]);
    }

    async getCredentials() {
        const file = await fetch("testing_credentials.json");
        const json = await file.json();
        return json;
    }

    //#endregion

    //#region Update

    update() {
        this.updateData();
    }

    updateData() {
        this.getData().then(([pricing, shortEMA, longEMA, vwap, macd, rsi]) => {
            // Parse all the data.
            this.parsePricing(pricing);
            this.parseEMAs(shortEMA, longEMA);
            this.parseVWAP(vwap);
            this.parseMACD(macd);
            this.parseRSI(rsi);

            // Update all the managers.
            this.priceManager.updateData(this.pricingData, this.volumeData, this.shortEMAData, this.longEMAData, this.vwapData);
            this.macdManager.updateData(this.macdData, this.macdSignalData, this.macdHistogramData);
            this.rsiManager.updateData(this.rsiData);
        });
    }

    //#endregion

    //#region Helper Functions

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

    validEntry(time) {
        return this.date === time.substring(0, 10)
    }

    timeIndex(time) {
        const hour = parseInt(time.substring(11, 13));
        const minute = parseInt(time.substring(14, 16));
        return ((hour - 9) * 60 + minute - 30 - 1);
    }

    //#endregion

    //#region Data Retrieval

    getData() {
        return Promise.all([
            this.getPricingData(),
            this.getShortEMAData(),
            this.getLongEMAData(),
            this.getVWAPData(),
            this.getMACDData(),
            this.getRSIData(),
        ]);
    }

    async getPricingData() {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${this.targetStock}&interval=1min&outputsize=full&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async getVWAPData() {
        const url = `https://www.alphavantage.co/query?function=VWAP&symbol=${this.targetStock}&interval=1min&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async getShortEMAData() {
        const url = `https://www.alphavantage.co/query?function=EMA&symbol=${this.targetStock}&interval=1min&time_period=${this.shortEMAPeriod}&series_type=close&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async getLongEMAData() {
        const url = `https://www.alphavantage.co/query?function=EMA&symbol=${this.targetStock}&interval=1min&time_period=${this.longEMAPeriod}&series_type=close&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async getMACDData() {
        const url = `https://www.alphavantage.co/query?function=MACD&symbol=${this.targetStock}&interval=5min&series_type=close&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async getRSIData() {
        const url = `https://www.alphavantage.co/query?function=RSI&symbol=${this.targetStock}&interval=5min&time_period=10&series_type=close&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    //#endregion

    //#region Data Parsing

    parsePricing(pricing) {
        this.volumeData = Array(390 / 5).fill(0);
        for (let category in pricing) {
            if (category === "Time Series (1min)") {
                for (let time in pricing[category]) {
                    if (this.validEntry(time)) {
                        for (let type in pricing[category][time]) {
                            if (type === "4. close") {
                                this.pricingData[this.timeIndex(time)] = parseFloat(pricing[category][time][type]);
                            } else if (type === "5. volume") {
                                this.volumeData[parseInt(this.timeIndex(time) / 5)] += parseFloat(pricing[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    parseEMAs(shortEMA, longEMA) {
        for (let category in shortEMA) {
            if (category === "Technical Analysis: EMA") {
                for (let time in shortEMA[category]) {
                    if (this.validEntry(time)) {
                        for (let type in shortEMA[category][time]) {
                            if (type === "EMA") {
                                this.shortEMAData[this.timeIndex(time)] = parseFloat(shortEMA[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
        for (let category in longEMA) {
            if (category === "Technical Analysis: EMA") {
                for (let time in longEMA[category]) {
                    if (this.validEntry(time)) {
                        for (let type in longEMA[category][time]) {
                            if (type === "EMA") {
                                this.longEMAData[this.timeIndex(time)] = parseFloat(longEMA[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    parseVWAP(vwap) {
        for (let category in vwap) {
            if (category === "Technical Analysis: VWAP") {
                for (let time in vwap[category]) {
                    if (this.validEntry(time)) {
                        for (let type in vwap[category][time]) {
                            if (type === "VWAP") {
                                if (parseFloat(vwap[category][time][type]) != 0)
                                    this.vwapData[this.timeIndex(time)] = parseFloat(vwap[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    parseMACD(macd) {
        for (let category in macd) {
            if (category === "Technical Analysis: MACD") {
                for (let time in macd[category]) {
                    if (this.validEntry(time)) {
                        for (let type in macd[category][time]) {
                            if (type === "MACD") {
                                this.macdData[parseInt(this.timeIndex(time) / 5)] = parseFloat(macd[category][time][type]);
                            } else if (type === "MACD_Signal") {
                                this.macdSignalData[parseInt(this.timeIndex(time) / 5)] = parseFloat(macd[category][time][type]);
                            } else if (type === "MACD_Hist") {
                                this.macdHistogramData[parseInt(this.timeIndex(time) / 5)] = parseFloat(macd[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    parseRSI(rsi) {
        for (let category in rsi) {
            if (category === "Technical Analysis: RSI") {
                for (let time in rsi[category]) {
                    if (this.validEntry(time)) {
                        for (let type in rsi[category][time]) {
                            if (type === "RSI") {
                                this.rsiData[parseInt(this.timeIndex(time) / 5)] = parseFloat(rsi[category][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    //#endregion
}

module.exports.Dashboard = Dashboard;