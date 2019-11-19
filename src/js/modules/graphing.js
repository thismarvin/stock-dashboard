const p5 = require("p5");

//#region Line Graph
class GraphData {
    constructor(id, data, thickness, zIndex, color) {
        this.id = id;
        this.data = data;
        this.thickness = thickness;
        this.zIndex = zIndex;
        this.color = color;
    }
}

module.exports.GraphData = GraphData;

class LineGraph {
    constructor(id, entries) {
        this.id = id;
        this.entries = entries;

        this.entries.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });

        this.minimum = 0;
        this.maximum = 0;
        this.range = 0;

        this.analyzeData();

        this.padding = 2;
        this.updateGraph = true;

        const attachedDiv = document.querySelector(`#${id}`);
        const instance = this;
        const sketch = (p5) => {

            let myCanvas;

            p5.setup = function () {
                myCanvas = p5.createCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                myCanvas.parent(attachedDiv);

                p5.frameRate(60);
            };

            p5.draw = function () {
                p5.drawGraph();
            };

            p5.windowResized = function () {
                myCanvas = p5.resizeCanvas(0, 0);
                setTimeout(() => {
                    myCanvas = p5.resizeCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                    instance.updateGraph = true;
                }, 250);
            }

            p5.drawGraph = function () {
                if (!instance.updateGraph) {
                    return;
                }

                p5.clear(0);
                instance.updateGraph = false;

                for (let i = 0; i < instance.entries.length; i++) {
                    p5.stroke(instance.entries[i].color);
                    p5.strokeWeight(instance.entries[i].thickness);
                    for (let j = 1; j < instance.entries[i].data.length; j++) {
                        if (instance.entries[i].data[j] === undefined ||
                            instance.entries[i].data[j - 1] === undefined) {
                            continue;
                        }
                        p5.line(
                            p5.map(j - 1, 1, instance.entries[i].data.length - 1, 0, p5.width),
                            p5.map(instance.entries[i].data[j - 1], instance.minimum, instance.maximum, p5.height - instance.padding, instance.padding),
                            p5.map(j, 1, instance.entries[i].data.length - 1, 0, p5.width),
                            p5.map(instance.entries[i].data[j], instance.minimum, instance.maximum, p5.height - instance.padding, instance.padding)
                        );
                    }
                }
            }
        };

        let myp5 = new p5(sketch, id);
    }

    analyzeData() {
        this.findRange();
    }

    findRange() {
        this.minimum = this.entries[0].data[0];
        this.maximum = this.entries[0].data[0];

        for (let i = 0; i < this.entries.length; i++) {
            for (let j = 0; j < this.entries[i].data.length; j++) {
                if (this.entries[i].data[j] === undefined) {
                    continue;
                }
                this.minimum = this.entries[i].data[j] < this.minimum ? this.entries[i].data[j] : this.minimum;
                this.maximum = this.entries[i].data[j] > this.maximum ? this.entries[i].data[j] : this.maximum;
            }
        }

        this.range = this.maximum - this.minimum;
    }

    updateData(entries) {
        this.updateGraph = true;
        this.entries = entries;
        this.analyzeData();
    }
}

module.exports.LineGraph = LineGraph;

//#endregion

class HistogramData {
    constructor(id, data, zIndex, color) {
        this.id = id;
        this.data = data;
        this.zIndex = zIndex;
        this.color = color;
    }
}

module.exports.HistogramData = HistogramData;

class Histogram {
    constructor(id, entries) {
        this.id = id;
        this.entries = entries;

        this.entries.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });

        this.minimum = 0;
        this.maximum = 0;
        this.range = 0;

        this.analyzeData();

        this.padding = 2;
        this.updateGraph = true;

        const attachedDiv = document.querySelector(`#${id}`);
        const instance = this;
        const sketch = (p5) => {

            let myCanvas;

            p5.setup = function () {
                myCanvas = p5.createCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                myCanvas.parent(attachedDiv);
            };

            p5.draw = function () {
                p5.drawGraph();
            };

            p5.windowResized = function () {
                myCanvas = p5.resizeCanvas(0, 0);
                setTimeout(() => {
                    myCanvas = p5.resizeCanvas(attachedDiv.clientWidth, attachedDiv.clientHeight);
                    instance.updateGraph = true;
                }, 250);
            }

            p5.drawGraph = function () {
                if (!instance.updateGraph || instance.maximum === undefined) {
                    return;
                }

                // Setup draw.
                instance.updateGraph = false;
                p5.clear(0);

                // Calculate the y value equivalent to zero.
                const start = p5.map(0, instance.minimum, instance.maximum, p5.height - instance.padding, instance.padding);                
                const topHeight = start;
                const bottomHeight = (p5.height - instance.padding) - start;

                // Draw a line representing the x-axis.
                p5.stroke(255);
                p5.line(0, start, p5.width, start);
                
                // Draw the Histogram.
                let histogramWidth;
                let histogramHeight;
                for (let i = 0; i < instance.entries.length; i++) {
                    // Setup the Histogram's styling.
                    p5.noStroke();
                    p5.fill(instance.entries[i].color);

                    histogramWidth = p5.width / instance.entries[i].data.length;

                    for (let j = 0; j < instance.entries[i].data.length; j++) {
                        if (instance.entries[i].data[j] === undefined) {
                            continue;
                        }

                        if (instance.entries[i].data[j] >= 0){
                            histogramHeight = p5.map(instance.entries[i].data[j], 0, instance.maximum, 0, topHeight);
                            p5.fill(0, 255, 0);
                            p5.rect(
                                j * histogramWidth,
                                start - histogramHeight,
                                histogramWidth,
                                histogramHeight
                            );
                        }
                        else {
                            histogramHeight = p5.map(instance.entries[i].data[j], instance.minimum, 0, bottomHeight, 0);
                            p5.fill(255, 0, 0);
                            p5.rect(
                                j * histogramWidth,
                                start,
                                histogramWidth,
                                histogramHeight
                            );
                        }
                        
                    }
                }
            }
        };

        let myp5 = new p5(sketch, id);
    }

    analyzeData() {
        this.findRange();
    }

    findRange() {
        this.minimum = this.entries[0].data[0];
        this.maximum = this.entries[0].data[0];

        for (let i = 0; i < this.entries.length; i++) {
            for (let j = 0; j < this.entries[i].data.length; j++) {
                if (this.entries[i].data[j] === undefined) {
                    continue;
                }
                this.minimum = this.entries[i].data[j] < this.minimum ? this.entries[i].data[j] : this.minimum;
                this.maximum = this.entries[i].data[j] > this.maximum ? this.entries[i].data[j] : this.maximum;
            }
        }

        this.range = this.maximum - this.minimum;
    }

    updateData(entries) {
        this.updateGraph = true;
        this.entries = entries;
        this.analyzeData();
    }
}

module.exports.Histogram = Histogram;