const p5 = require("p5");
const {
    Manager
} = require("./manager.js");

class Price extends Manager {
    constructor(alphavantageKey, date) {
        super();

        this.pricingData = Array(390).fill(undefined);
        this.alphavantageKey = alphavantageKey;
        this.date = date;

        this.updateData();

        const id = "price";
        const attachedDiv = document.querySelector(`#${id}`);
        const instance = this;
        const sketch = (p5) => {

            let myCanvas;

            p5.setup = function () {
                myCanvas = p5.createCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                myCanvas.parent(attachedDiv);
            };

            p5.draw = function () {
                p5.background(0);
                p5.drawGraph();
            };

            p5.windowResized = function () {
                myCanvas = p5.resizeCanvas(0, 0);
                myCanvas = p5.resizeCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);                
            }

            p5.drawGraph = function () {
                const graphInfo = p5.setupGraph();
                const minimum = graphInfo["minimum"];
                const maximum = graphInfo["maximum"];

                for (let i = 1; i < instance.pricingData.length; i++) {
                    if (instance.pricingData[i] === undefined ||
                        instance.pricingData[i - 1] === undefined) {
                        continue;
                    }
                    p5.stroke(255);
                    p5.strokeWeight(2);
                    p5.line(
                        p5.map(i - 1, 0, 390, 0, p5.width),
                        p5.map(instance.pricingData[i - 1], minimum, maximum, p5.height, 0),
                        p5.map(i, 0, 390, 0, p5.width),
                        p5.map(instance.pricingData[i], minimum, maximum, p5.height, 0)
                    );
                }
            }

            p5.setupGraph = function () {
                let minPricing = instance.pricingData[0];
                let maxPricing = instance.pricingData[0];

                for (let i = 1; i < instance.pricingData.length; i++) {
                    if (instance.pricingData[i] === undefined) {
                        continue;
                    }
                    minPricing = instance.pricingData[i] < minPricing ? instance.pricingData[i] : minPricing;
                    maxPricing = instance.pricingData[i] > maxPricing ? instance.pricingData[i] : maxPricing;
                }

                return {
                    "minimum": minPricing,
                    "maximum": maxPricing
                };
            }
        };

        let myp5 = new p5(sketch, id);
    }

    updateData() {
        this.getData().then(([pricing]) => {
            this.parsePricing(pricing);
        });
    }

    getData() {
        return Promise.all([this.getPricingData()]);
    }

    async getPricingData() {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${"SPY"}&interval=1min&outputsize=full&apikey=${this.alphavantageKey}`;
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    parsePricing(pricing) {
        for (let key in pricing) {
            if (key === "Time Series (1min)") {
                for (let time in pricing[key]) {
                    if (this.validEntry(time)) {
                        for (let type in pricing[key][time]) {
                            if (type === "4. close") {
                                //console.log(`${time}: ${(parseFloat(pricing[key][time][type]))}`);
                                this.pricingData[this.timeIndex(time)] = parseFloat(pricing[key][time][type]);
                            }
                        }
                    }
                }
            }
        }
    }

    validEntry(time) {
        return this.date === time.substring(0, 10)
    }

    timeIndex(time) {
        const hour = parseInt(time.substring(11, 13));
        const minute = parseInt(time.substring(14, 16));
        return ((hour - 9) * 60 + minute - 30 - 1);
    }

}

module.exports.Price = Price;