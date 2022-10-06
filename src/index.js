import fs from "node:fs";

const trainImageStream = fs.createReadStream(`data/emnist-letters-train-images`, {
  highWaterMark: 1
});

const trainLabelStream = fs.createReadStream(`data/emnist-letters-train-labels`, {
  highWaterMark: 1
});


function getImageDetails(dataStream) {
  return new Promise((resolve, reject) => {
    let numImages, rows, cols;
    let data = [];
    let ctr = 0;

    dataStream.on("data", function (buff) {
      data.push(buff.readUInt8(0));
      ctr++;

      if (ctr == 4) data = [];

      if (ctr == 8) {
        numImages = Buffer.from(data).readUInt32BE(0);
        data = [];
      };

      if (ctr == 12) {
        rows = Buffer.from(data).readUInt32BE(0);
        data = [];
      };

      if (ctr == 16) {
        this.pause();
        this.removeAllListeners("data");
        cols = Buffer.from(data).readUInt32BE(0);

        resolve({
          numImages, rows, cols
        });
      };

    });

  });
};

function getLabelDetails(dataStream) {
  return new Promise((resolve, reject) => {
    let numLabels;
    let data = [];
    let ctr = 0;

    dataStream.on("data", function (buff) {
      data.push(buff.readUInt8(0));
      ctr++;

      if (ctr == 4) data = [];

      if (ctr == 8) {
        this.pause();
        this.removeAllListeners("data");
        numLabels = Buffer.from(data).readUInt32BE(0);

        resolve({
          numLabels
        });
      };

    });
  });
};

function getNextImages(dataStream, imageCount = 1) {
  return new Promise((resolve, reject) => {

    const imageSize = rows * cols;
    let colCtr = 0, rowCtr = 0, imageCtr = 0;
    let images = new Array(imageCount);
    let image = new Array(rows);
    let imageRow = new Array(cols);

    dataStream.on("data", function (buff) {
      imageRow[colCtr] = Math.round(buff.readUint8(0) / 255);
      colCtr++;

      if (colCtr == cols) {
        image[rowCtr] = imageRow;
        imageRow = new Array(cols);
        colCtr = 0;
        rowCtr++;
      };

      if (rowCtr == rows) {
        images[imageCtr] = image;
        image = new Array(rows);
        colCtr = rowCtr = 0;
        imageCtr++;
      };

      if (imageCtr == imageCount) {
        this.pause();
        this.removeAllListeners("data");
        resolve(images);
      };

    });
    dataStream.on("error", function (err) { reject(err); });
    dataStream.resume();
  });
};

function getNextLabels(dataStream, labelCount = 1) {
  return new Promise((resolve, reject) => {

    let labels = new Array(labelCount);
    let labelCtr = 0;

    dataStream.on("data", function (buff) {
      labels[labelCtr] = buff.readUint8(0);
      labelCtr++;

      if (labelCtr == labelCount) {
        this.pause();
        this.removeAllListeners("data");
        resolve(labels);
      };

    });
    dataStream.on("error", function (err) { reject(err); });
    dataStream.resume();
  });
};

const { numImages, rows, cols } = await getImageDetails(trainImageStream);
const { numLabels } = await getLabelDetails(trainLabelStream);

const [image] = await getNextImages(trainImageStream);
const [label] = await getNextLabels(trainLabelStream);

console.log(label);

let str = "";

// for (let row = 0; row < rows; row++) {
//   for (let col = 0; col < cols; col++) {
//     str += image[row][col];
//   };
//   str += "\r\n";
// };
// fs.writeFileSync("image.txt", str);



