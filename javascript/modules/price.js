const p5 = require("p5");
const {
    Graph
} = require("./graph.js");

class Price extends Graph {
    constructor(alphavantageKey) {
        super();

        this.data = Array(390).fill(undefined);
        this.alphavantageKey = alphavantageKey;
        //this.updatePricingData();

        //this.updateData();

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
            };

            p5.windowResized = function () {
                myCanvas = p5.resizeCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
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
                    //if (validTradingDate(time)) {
                        for (let type in pricing[key][time]) {
                            if (type === "4. close") {
                                console.log(`${time}: ${(parseFloat(pricing[key][time][type]))}`);
                            }
                        }
                    //}
                }
            }
        }
    }
    
}

module.exports.Price = Price;