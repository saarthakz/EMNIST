import fs from "node:fs/promises";
import * as tf from "@tensorflow/tfjs-node";
import model from "./model.js";

class ImageStream {
  #path: string;
  #file: fs.FileHandle;
  #numImages: number;
  #rows: number;
  #cols: number;
  #imageDims: number;
  #isInitialized = false;

  constructor(path: string) {
    this.#path = path;
  };

  async init() {
    if (this.#isInitialized) return;
    this.#file = await fs.open(this.#path);
    await this.#file.read({ length: 4 }); //Magic Number
    this.#numImages = (await this.#file.read({ length: 4 })).buffer.readUInt32BE(0);
    this.#rows = (await this.#file.read({ length: 4 })).buffer.readUInt32BE(0);
    this.#cols = (await this.#file.read({ length: 4 })).buffer.readUInt32BE(0);
    this.#imageDims = this.#rows * this.#cols;
    this.#isInitialized = true;
    return this;
  };

  getDetails() {
    return {
      rows: this.#rows,
      cols: this.#cols,
      numImages: this.#numImages
    };
  };

  async #getNextImage() {
    const { buffer, bytesRead } = (await this.#file.read({ length: this.#imageDims }));
    return Array.from(buffer).slice(0, this.#imageDims);
  };

  async getImages(num = 1) {
    const images: number[][][] = new Array(num);
    for (let idx = 0; idx < num; idx++) {
      images[idx] =
        ImageStream.#transpose(
          ImageStream.#normalize(
            ImageStream.#_1dTo2d(
              this.#rows, this.#cols, await this.#getNextImage()
            )
          )
        );
    };
    return images;
  };

  static #_1dTo2d(rows: number, cols: number, arr: number[]) {
    const grid: number[][] = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        grid[row][col] = arr[cols * row + col];
      };
    };
    return grid;
  };

  static #normalize(grid: number[][]) {
    return grid.map((row) => row.map((num) => Math.round(num / 255)));
  };

  static #transpose(grid: number[][]) {
    const rows = grid.length;
    const cols = grid[0].length;
    const newGrid: number[][] = new Array(cols).fill(0)
      .map(() => new Array(rows).fill(0));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newGrid[row][col] = grid[col][row];
      };
    };

    return newGrid;
  };

  async close() {
    await this.#file.close();
  };
};

class LabelStream {
  #path: string;
  #file: fs.FileHandle;
  #numLabels: number;
  #isInitialized = false;

  constructor(path: string) {
    this.#path = path;
  };

  async init() {
    if (this.#isInitialized) return this;
    this.#file = await fs.open(this.#path);
    await this.#file.read({ length: 4 }); //Magic number
    this.#numLabels = (await this.#file.read({ length: 4 })).buffer.readUInt32BE(0);
    this.#isInitialized = true;
    return this;
  };

  getDetails() {
    return {
      numLabels: this.#numLabels
    };
  };

  async #getNextLabel() {
    return (await this.#file.read({ length: 1 })).buffer.readUInt8(0);
  };

  async getLabels(num = 1) {
    const labels: number[] = new Array(num);
    for (let idx = 0; idx < num; idx++) {
      labels[idx] = await this.#getNextLabel();
    };
    return labels;
  };

  async close() {
    await this.#file.close();
  };
};

function printProgress(progress: number) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(progress + '%');
};

const EPOCHS = 5;
const BATCH_SIZE = 200;
const TEST_BATCH_SIZE = 200;
// const CLASSES = 26; //For Letters
const CLASSES = 47; //For Balanced

//For every epoch
for (let epoch = 0; epoch < EPOCHS; epoch++) {

  // const trainImageStream = new ImageStream("./data/emnist-letters-train-images");
  // const trainLabelStream = new LabelStream("./data/emnist-letters-train-labels");

  // const testImageStream = new ImageStream("./data/emnist-letters-test-images");
  // const testLabelStream = new LabelStream("./data/emnist-letters-test-labels");

  const trainImageStream = new ImageStream("./data/emnist-balanced-train-images");
  const trainLabelStream = new LabelStream("./data/emnist-balanced-train-labels");

  const testImageStream = new ImageStream("./data/emnist-balanced-test-images");
  const testLabelStream = new LabelStream("./data/emnist-balanced-test-labels");

  await Promise.all([
    trainImageStream.init(),
    trainLabelStream.init(),
    testImageStream.init(),
    testLabelStream.init()
  ]);

  const { rows, cols, numImages } = trainImageStream.getDetails();
  const { numImages: testNumImages } = testImageStream.getDetails();

  const BATCHES = numImages / BATCH_SIZE;

  let finalLoss = 0, finalAcc = 0;

  //For every batch in the training data
  for (let cnt = 0; cnt < BATCHES; cnt++) {
    const images = await trainImageStream.getImages(BATCH_SIZE);
    const labels = await trainLabelStream.getLabels(BATCH_SIZE);

    const xs = tf.tensor3d(images).reshape([images.length, rows, cols, 1]);
    const ys = tf.oneHot(labels, CLASSES);

    const history = await model.trainOnBatch(xs, ys);

    printProgress(cnt / BATCHES * 100);

    if (history instanceof Array) {
      const [loss, acc] = history;
      finalLoss = loss;
      finalAcc = acc;
    };
    tf.dispose(xs);
    tf.dispose(ys);
  };

  printProgress(100);

  console.log("");
  console.log(`Loss: ${finalLoss} Acc: ${finalAcc}`);

  const TEST_BATCHES = testNumImages / TEST_BATCH_SIZE;

  let _history: tf.Scalar | tf.Scalar[];

  for (let cnt = 0; cnt < TEST_BATCHES; cnt++) {
    const testImages = await testImageStream.getImages(TEST_BATCH_SIZE);
    const testLabels = await testLabelStream.getLabels(TEST_BATCH_SIZE);

    const xs = tf.tensor3d(testImages).reshape([testImages.length, rows, cols, 1]);
    const ys = tf.oneHot(testLabels, CLASSES);
    _history = model.evaluate(xs, ys, {
      batchSize: TEST_BATCH_SIZE,
    });

    printProgress(cnt / TEST_BATCHES * 100);

    tf.dispose(xs);
    tf.dispose(ys);
  };

  printProgress(100);

  console.log("");

  if (_history! instanceof Array) {
    const [valLoss, valAcc] = _history;
    console.log(`Val Loss: ${valLoss.arraySync()} Val Acc: ${valAcc.arraySync()}`);
  } else _history!.print();

  await Promise.all([
    trainImageStream.close(),
    trainLabelStream.close(),
    testImageStream.close(),
    testLabelStream.close()
  ]);
};

// await model.save("file://model/Letters-Model");
await model.save("file://model/Balanced-Model");

