const p5 = require("p5");

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