// Im not really sure who to properly setup an electron app,
// but this is basically going to be the root of the app.
// 🦀🦀🦀

const mysql = require('mysql');

const {
    PriceManager,
    MACDManager,
    RSIManager
} = require("./modules/managers");

class Dashboard {
    constructor() {
        this.alphavantageKey = null;

        this.validTradingDay = true;
        this.date = null;
        this.parseDate();

        this.updateFrequency = 60;
        this.targetStock = null;
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

        this.state = 1;
        this.setup = false;

        this.databaseConnection = null;
        this.connectedToDatabase = false;
        this.entryID = null;
    }

    //#region Initialization

    jumpstart(apikey, stock, frequency) {
        if (typeof apikey !== "string" || typeof stock !== "string" || typeof frequency !== "number") {
            return;
        }

        this.alphavantageKey = apikey;
        this.targetStock = stock;
        this.updateFrequency = frequency;

        this.update();

        setTimeout(() => {
            this.priceManager.jumpstart();
            this.macdManager.jumpstart();
            this.rsiManager.jumpstart();
        }, 10 * 1000);

        setInterval(() => {
            this.update();
        }, this.updateFrequency * 1000);

        this.setup = true;
    }

    async connectToDatabase(host, port, user, password, database) {
        this.databaseConnection = mysql.createConnection({
            host: host,
            port: port,
            user: user,
            password: password,
            database: database
        });

        this.connectedToDatabase = await this.queryDatabaseConnection();
        if (this.connectedToDatabase) {
            const entryExists = await this.queryForExistingEntry();

            if (!entryExists) {
                await this.queryNewEntryCreation();
            }

            this.entryID = await this.queryEntryID();
            console.log(`The current entry's ID is ${this.entryID}`);

            if (!entryExists) {
                this.newEntryFirstTimeSetup();
            }
        }
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

            this.saveToDatabase();
        });
    }

    //#endregion

    //#region MySQL Logic

    endDatabaseConnection() {
        if (this.connectedToDatabase) {
            this.databaseConnection.end();
        }
    }

    queryDatabaseConnection() {
        console.log("Attempting to connect to database...");
        return new Promise(resolve => {
            this.databaseConnection.connect((err) => {
                if (err) {
                    console.log("Could not connect to MySQL database.");
                    resolve(false);
                    return;
                }

                console.log("Successfully connected to MySQL database!");
                resolve(true);
            });
        });
    }

    queryForExistingEntry() {
        const sql = `
        SELECT * FROM entries
        WHERE
        stock="${this.targetStock}" AND
        date="${this.date}"
        ;
        `;

        console.log("Checking if an entry already exists.")
        return new Promise(resolve => {
            this.databaseConnection.query(sql, (err, results) => {
                if (err) {
                    throw err;
                }
                resolve(results.length !== 0);
            });
        });
    }

    queryNewEntryCreation() {
        const sql = `
        INSERT INTO entries (
        stock,
        date
        )
        VALUES (
        "${this.targetStock}",
        "${this.date}"
        );
        `;

        console.log("Creating a new entry.");
        return new Promise(resolve => {
            this.databaseConnection.query(sql, (err) => {
                if (err) {
                    throw err;
                }
                resolve(true);
            });
        });
    }

    queryEntryID() {
        const sql = `
        SELECT entryid FROM entries
        WHERE
        stock="${this.targetStock}" AND
        date="${this.date}"
        ;
        `;

        console.log("Getting the current entry's ID");
        return new Promise(resolve => {
            this.databaseConnection.query(sql, (err, results) => {
                if (err) {
                    throw err;
                }
                resolve(results[0].entryid);
            });
        });
    }

    queryNewEntryInsertion(i) {
        const sql = `
        INSERT INTO data (
        entryid,
        time
        )
        VALUES (
        ${this.entryID},
        ${i}
        );
        `;

        return new Promise(resolve => {
            this.databaseConnection.query(sql, (err) => {
                if (err) {
                    throw err;
                }
                resolve();
            });
        });
    }

    queryEntryUpdate(i) {
        if (
            this.pricingData[i] === undefined ||
            this.volumeData[parseInt(i / 5)] === undefined ||
            this.shortEMAData[i] === undefined ||
            this.longEMAData[i] === undefined ||
            this.vwapData[i] === undefined ||
            this.macdData[parseInt(i / 5)] === undefined ||
            this.macdSignalData[parseInt(i / 5)] === undefined ||
            this.macdHistogramData[parseInt(i / 5)] === undefined ||
            this.rsiData[parseInt(i / 5)] === undefined
        ) {
            return new Promise(resolve => resolve());
        }

        const sql = `
        UPDATE data
        SET
        price=${this.pricingData[i]},
        volume=${this.volumeData[parseInt(i / 5)]},
        shortema=${this.shortEMAData[i]},
        longema=${this.shortEMAData[i]},
        vwap=${this.longEMAData[i]},
        macd=${this.macdData[parseInt(i / 5)]},
        macdsignal=${this.macdSignalData[parseInt(i / 5)]},
        macdhistogram=${this.macdHistogramData[parseInt(i / 5)]},
        rsi=${this.rsiData[parseInt(i / 5)]}
        WHERE
        entryid=${this.entryID} AND
        time=${i}
        ;
        `;

        return new Promise(resolve => {
            this.databaseConnection.query(sql, (err) => {
                if (err) {
                    throw err;
                }
                resolve();
            });
        });
    }

    async newEntryFirstTimeSetup() {
        console.log("Setting up new entry.");
        for (let i = 0; i < 390; i++) {
            await this.queryNewEntryInsertion(i);
        }
        console.log("New entry's first time setup is complete.");
    }

    async saveToDatabase() {
        if (!this.connectToDatabase || this.entryID === null) {
            return;
        }

        for (let i = 0; i < 390; i++) {
            await this.queryEntryUpdate(i);
        }
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