const {
    Grapher,
    GraphEntry,
    GraphHelper,
    LineGraph,
    Histogram,
} = require("./graphing");

class PriceManager {
    constructor(pricing, volume, shortEMA, longEMA, vwap) {
        this.grapher = new Grapher("price");

        let volumeGraph = new Histogram(volume);
        volumeGraph.addStyling({
            "color": "#3A3D51"
        });
        volumeGraph.addStyling({
            "border": 1
        });
        this.grapher.attach(
            new GraphEntry(
                "volume",
                volumeGraph,
                1
            )
        );

        let pricingGraph = new LineGraph(pricing);
        pricingGraph.addStyling({
            "color": "#9AACCD"
        });
        pricingGraph.addStyling({
            "thickness": 2
        });

        this.grapher.attach(
            new GraphEntry(
                "pricing",
                pricingGraph,
                2
            )
        );

        let shortEMAGraph = new LineGraph(shortEMA);
        shortEMAGraph.addStyling({
            "color": "#FF77A7"
        });
        shortEMAGraph.addStyling({
            "thickness": 2
        });

        this.grapher.attach(
            new GraphEntry(
                "shortEMA",
                shortEMAGraph,
                4
            )
        );

        let loneEMAGraph = new LineGraph(longEMA);
        loneEMAGraph.addStyling({
            "color": "#FFBF55"
        });
        loneEMAGraph.addStyling({
            "thickness": 2
        });

        this.grapher.attach(
            new GraphEntry(
                "longEMA",
                loneEMAGraph,
                3
            )
        );

        let vwapGraph = new LineGraph(vwap);
        vwapGraph.addStyling({
            "color": "#FFFFFF"
        });
        vwapGraph.addStyling({
            "thickness": 2
        });

        this.grapher.attach(
            new GraphEntry(
                "vwap",
                vwapGraph,
                5
            )
        );

        for (let i of this.grapher.entries) {
            i.graph.addStyling({
                "padding": 5
            });
        }
        this.grapher.applyChanges();
    }

    jumpstart() {
        this.grapher.applyChanges();
    }

    updateData(pricing, volume, shortEMA, longEMA, vwap) {
        const volumeGraph = this.grapher.getEntry("volume").graph;
        const pricingGraph = this.grapher.getEntry("pricing").graph;
        const shortEMAGraph = this.grapher.getEntry("shortEMA").graph;
        const longEMAGraph = this.grapher.getEntry("longEMA").graph;
        const vwapGraph = this.grapher.getEntry("vwap").graph;

        volumeGraph.setData(volume);
        pricingGraph.setData(pricing);
        shortEMAGraph.setData(shortEMA);
        longEMAGraph.setData(longEMA);
        vwapGraph.setData(vwap);

        let range;
        range = GraphHelper.findRange(volumeGraph);
        volumeGraph.setRange(range.min, range.max);

        let challenger;
        challenger = GraphHelper.findRange(pricingGraph);
        range.min = challenger.min;
        range.max = challenger.max;

        challenger = GraphHelper.findRange(shortEMAGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        challenger = GraphHelper.findRange(longEMAGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        challenger = GraphHelper.findRange(vwapGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        pricingGraph.setRange(range.min, range.max);
        shortEMAGraph.setRange(range.min, range.max);
        longEMAGraph.setRange(range.min, range.max);
        vwapGraph.setRange(range.min, range.max);

        this.grapher.applyChanges();
    }
}

module.exports.PriceManager = PriceManager;

class MACDManager {
    constructor(macd, macdSignal, macdHistogram) {
        this.grapher = new Grapher("macd");

        let macdGraph = new LineGraph(macd);
        macdGraph.addStyling({
            "color": "#29ADFF"
        });
        macdGraph.addStyling({
            "thickness": 3
        });
        this.grapher.attach(
            new GraphEntry(
                "macd",
                macdGraph,
                2
            )
        );

        let macdSignalGraph = new LineGraph(macdSignal);
        macdSignalGraph.addStyling({
            "color": "#2955CE"
        });
        macdSignalGraph.addStyling({
            "thickness": 3
        });
        this.grapher.attach(
            new GraphEntry(
                "macdSignal",
                macdSignalGraph,
                2
            )
        );

        let zeroGraph = new LineGraph([0, 0, 0]);
        zeroGraph.addStyling({
            "color": "#9AACCD"
        });
        this.grapher.attach(
            new GraphEntry(
                "zero",
                zeroGraph,
                3
            )
        );

        let macdHistogramGraph = new Histogram(macdHistogram);
        macdHistogramGraph.addStyling({
            "border": 1
        });
        macdHistogramGraph.addStyling({
            "palette": {
                "positive": "#3ECD56",
                "negative": "#FF004D"
            }
        });
        this.grapher.attach(
            new GraphEntry(
                "macdHistogram",
                macdHistogramGraph,
                1
            )
        );

        for (let i of this.grapher.entries) {
            i.graph.addStyling({
                "padding": 5
            });
        }
        this.grapher.applyChanges();
    }

    jumpstart() {
        this.grapher.applyChanges();
    }

    updateData(macd, macdSignal, macdHistogram) {
        const zeroGraph = this.grapher.getEntry("zero").graph;
        const macdGraph = this.grapher.getEntry("macd").graph;
        const macdSignalGraph = this.grapher.getEntry("macdSignal").graph;
        const macdHistogramGraph = this.grapher.getEntry("macdHistogram").graph;

        macdGraph.setData(macd);
        macdSignalGraph.setData(macdSignal);
        macdHistogramGraph.setData(macdHistogram);

        let range;
        range = GraphHelper.findRange(zeroGraph);

        let challenger;
        challenger = GraphHelper.findRange(macdGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        challenger = GraphHelper.findRange(macdSignalGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        challenger = GraphHelper.findRange(macdHistogramGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        zeroGraph.setRange(range.min, range.max);
        macdGraph.setRange(range.min, range.max);
        macdSignalGraph.setRange(range.min, range.max);
        macdHistogramGraph.setRange(range.min, range.max);

        this.grapher.applyChanges();
    }
}

module.exports.MACDManager = MACDManager;

class RSIManager {
    constructor(rsi) {
        this.grapher = new Grapher("rsi");

        let rsiGraph = new LineGraph(rsi);
        rsiGraph.addStyling({
            "thickness": 3
        });
        this.grapher.attach(
            new GraphEntry(
                "rsi",
                rsiGraph,
                2
            )
        );

        let overSoldGraph = new LineGraph([30, 30, 30]);
        overSoldGraph.addStyling({
            "color": "#9AACCD"
        });
        this.grapher.attach(
            new GraphEntry(
                "overSold",
                overSoldGraph
            )
        );

        let overBoughtGraph = new LineGraph([70, 70, 70]);
        overBoughtGraph.addStyling({
            "color": "#9AACCD"
        });
        this.grapher.attach(
            new GraphEntry(
                "overBought",
                overBoughtGraph
            )
        );

        for (let i of this.grapher.entries) {
            i.graph.addStyling({
                "padding": 5
            });
        }
        this.grapher.applyChanges();
    }

    jumpstart() {
        this.grapher.applyChanges();
    }

    updateData(rsi) {
        const overSoldGraph = this.grapher.getEntry("overSold").graph;
        const overBoughtGraph = this.grapher.getEntry("overBought").graph;
        const rsiGraph = this.grapher.getEntry("rsi").graph;

        rsiGraph.setData(rsi);

        let range = {
            "min": 30 - 5,
            "max": 70 + 5
        };
        const challenger = GraphHelper.findRange(rsiGraph);
        range.min = challenger.min < range.min ? challenger.min : range.min;
        range.max = challenger.max > range.max ? challenger.max : range.max;

        overSoldGraph.setRange(range.min, range.max);
        overBoughtGraph.setRange(range.min, range.max);
        rsiGraph.setRange(range.min, range.max);

        this.grapher.applyChanges();
    }
}

module.exports.RSIManager = RSIManager;