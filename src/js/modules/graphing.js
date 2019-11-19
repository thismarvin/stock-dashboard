const p5 = require("p5");

class Grapher {
    constructor(id) {
        this.id = id;
        this.entries = [];

        this.updateGraph = false;

        this.createSketch();
    }

    applyChanges() {
        this.updateGraph = true;
    }

    attach(entry) {
        this.entries.push(entry);

        this.entries.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });

        this.applyChanges();
    }

    getEntry(name) {
        for (let i of this.entries) {
            if (i.name === name) {
                return i;
            }
        }
        return null;
    }

    createSketch() {
        const attachedDiv = document.querySelector(`#${this.id}`);
        const instance = this;
        const sketch = (p5) => {

            let myCanvas;

            p5.setup = function () {
                myCanvas = p5.createCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                myCanvas.parent(attachedDiv);
            };

            p5.draw = function () {

                if (instance.updateGraph) {
                    p5.clear();
                    for (let i of instance.entries) {
                        i.graph.draw(p5);
                    }
                    instance.updateGraph = false;
                }

            };

            p5.windowResized = function () {
                myCanvas = p5.resizeCanvas(0, 0);
                setTimeout(() => {
                    myCanvas = p5.resizeCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                    instance.updateGraph = true;
                }, 100);
            }
        };

        const myp5 = new p5(sketch, this.id);
    }
}

module.exports.Grapher = Grapher;

class GraphEntry {
    constructor(name, graph, zIndex = 1) {
        this.name = name;
        this.graph = graph;
        this.zIndex = zIndex;
    }
}

module.exports.GraphEntry = GraphEntry;


class GraphHelper {
    static findRange(graph) {
        let min = graph.data[0];
        let max = min;

        for (let i = 0; i < graph.data.length; i++) {
            if (!graph.data[i]) {
                continue;
            }
            min = graph.data[i] < min ? graph.data[i] : min;
            max = graph.data[i] > max ? graph.data[i] : max;
        }

        let range = max - min;

        min = !min ? 0 : min;
        max = !max ? 0 : max;
        range = !range ? 0 : range;

        return {
            "min": min,
            "max": max,
            "range": range
        }
    }
}

module.exports.GraphHelper = GraphHelper;

class Graph {
    constructor(data) {
        this.data = data;
        this.min = 0;
        this.max = 0;
        this.styling = [];
    }

    setData(data) {
        this.data = data;
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
    }

    getPadding() {
        for (let i of this.styling) {
            if (i.padding) {
                return i.padding;
            }
        }
        return 0;
    }

    addStyling(styling) {
        this.styling.push(styling);
    }

    draw(p5) {
        console.log("ummmm");
    }
}

class Histogram extends Graph {
    constructor(data) {
        super(data);
    }

    getBorder() {
        for (let i of this.styling) {
            if (i.border) {
                return i.border;
            }
        }
        return 0;
    }

    getColor(options = {}) {
        if (options["palette"]) {
            for (let i of this.styling) {
                if (i.palette && i.palette[options["palette"]]) {
                    return i.palette[options["palette"]];
                }
            }
        }

        for (let i of this.styling) {
            if (i.color) {
                return i.color;
            }
        }
        return "#FFFFFF";
    }

    draw(p5) {

        if (this.min === undefined && this.max === undefined) {
            return;
        }

        // Calculate the y value equivalent to zero.
        const start = p5.map(0, this.min, this.max, p5.height - this.getPadding(), this.getPadding());
        const topHeight = start;
        const bottomHeight = (p5.height - this.getPadding()) - start;

        /*
        // Draw a line representing the x-axis.
        p5.strokeWeight(1);
        p5.stroke(0);
        p5.line(0, start, p5.width, start);
        */

        // Draw the Histogram.
        let histogramWidth;
        let histogramHeight;

        // Setup the Histogram's styling.
        p5.noStroke();

        histogramWidth = (p5.width - this.getPadding() * 2 - this.getBorder() * 2 * this.data.length) / this.data.length;

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i] === undefined) {
                continue;
            }

            if (this.data[i] >= 0) {
                histogramHeight = p5.map(this.data[i], 0, this.max, 0, topHeight);
                p5.fill(this.getColor({
                    "palette": "positive"
                }));
                p5.rect(
                    i * histogramWidth + (2 * this.getBorder() * i + this.getBorder()),
                    start - histogramHeight,
                    histogramWidth,
                    histogramHeight
                );
            } else {
                histogramHeight = p5.map(this.data[i], this.min, 0, bottomHeight, 0);
                p5.fill(this.getColor({
                    "palette": "negative"
                }));
                p5.rect(
                    i * histogramWidth + (2 * this.getBorder() * i + this.getBorder()),
                    start,
                    histogramWidth,
                    histogramHeight
                );
            }
        }
    }
}

module.exports.Histogram = Histogram;


class LineGraph extends Graph {
    constructor(data) {
        super(data);
    }

    getColor(options = {}) {
        if (options["palette"]) {
            for (let i of this.styling) {
                if (i.palette && i.palette[options["palette"]]) {
                    return i.palette[options["palette"]];
                }
            }
        }

        for (let i of this.styling) {
            if (i.color) {
                return i.color;
            }
        }

        return "#FFFFFF";
    }

    getThickness() {
        for (let i of this.styling) {
            if (i.thickness) {
                return i.thickness;
            }
        }

        return 1;
    }


    draw(p5) {

        if (this.min === undefined && this.max === undefined) {
            return;
        }

        p5.stroke(this.getColor());
        p5.strokeWeight(this.getThickness());

        for (let i = 1; i < this.data.length; i++) {
            if (this.data[i] === undefined || this.data[i - 1] === undefined) {
                continue;
            }
            p5.line(
                p5.map(i - 1, 1, this.data.length - 1, 0, p5.width),
                p5.map(this.data[i - 1], this.min, this.max, p5.height - this.getPadding(), this.getPadding()),
                p5.map(i, 1, this.data.length - 1, 0, p5.width),
                p5.map(this.data[i], this.min, this.max, p5.height - this.getPadding(), this.getPadding())
            );
        }
    }
}

module.exports.LineGraph = LineGraph;