const {
    GraphData,
    LineGraph,
} = require("./graphing");

class PriceManager {
    constructor(pricing, volume, shortEMA, longEMA, vwap) {
        this.pricingGraph = new LineGraph(
            "price",
            [
                new GraphData("price", pricing, 2, 1, "#00E756"),
                new GraphData("shortEMA", shortEMA, 2, 2, "#FF77A8"),
                new GraphData("longEMA", longEMA, 2, 3, "#FFA300"),
                new GraphData("vwap", vwap, 1, 4, "#FFFFFF"),
            ]
        );
    }

    updateData(pricing, volume, shortEMA, longEMA, vwap) {
        this.pricingGraph.updateData(
            [
                new GraphData("price", pricing, 2, 1, "#00E756"),
                new GraphData("shortEMA", shortEMA, 2, 2, "#FF77A8"),
                new GraphData("longEMA", longEMA, 2, 3, "#FFA300"),
                new GraphData("vwap", vwap, 1, 4, "#FFFFFF"),
            ]
        );
    }
}

module.exports.PriceManager = PriceManager;

class MACDManager {
    constructor(macd, macdSignal, macdHistogram) {
        this.macdGraph = new LineGraph(
            "macd",
            [
                new GraphData("zero", [0], 1, 1, "#FFFFFF"),
                new GraphData("macd", macd, 2, 2, "#29ADFF"),
                new GraphData("macdSignal", macdSignal, 2, 2, "#0000FC"),
            ]
        );
    }

    updateData(macd, macdSignal, macdHistogram) {
        this.macdGraph.updateData(
            [
                new GraphData("zero", [0, 0, 0], 1, 1, "#FFFFFF"),
                new GraphData("macd", macd, 2, 2, "#29ADFF"),
                new GraphData("macdSignal", macdSignal, 2, 2, "#0000FC"),
            ]
        );
    }
}

module.exports.MACDManager = MACDManager;

class RSIManager {
    constructor(rsi) {
        this.rsiGraph = new LineGraph(
            "rsi",
            [
                new GraphData("bottom", [0], 1, 1, "#000000"),
                new GraphData("top", [100], 1, 1, "#000000"),

                new GraphData("topLine", [80, 80, 80], 1, 1, "#FFFFFF"),
                new GraphData("bottomLine", [20, 20, 20], 1, 1, "#FFFFFF"),

                new GraphData("rsi", rsi, 2, 2, "#FFFFFF"),
            ]
        );
    }

    updateData(rsi) {
        this.rsiGraph.updateData(
            [
                new GraphData("bottom", [0], 1, 1, "#000000"),
                new GraphData("top", [100], 1, 1, "#000000"),

                new GraphData("topLine", [80, 80, 80], 1, 1, "#FFFFFF"),
                new GraphData("bottomLine", [20, 20, 20], 1, 1, "#FFFFFF"),

                new GraphData("rsi", rsi, 2, 2, "#FFFFFF"),
            ]
        );
    }
}

module.exports.RSIManager = RSIManager;