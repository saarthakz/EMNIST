import fs from "node:fs";

export default function* (type) {

  const imageBin = fs.readFileSync(`data/emnist-letters-${type}-images`);
  const labelsBin = fs.readFileSync(`data/emnist-letters-${type}-labels`);

  let numImages = imageBin.readUInt32BE(4);
  const rows = imageBin.readUInt32BE(8);
  const cols = imageBin.readUInt32BE(12);

  let imagePtr = 16;
  let labelPtr = 8;

  for (let imgIdx = 0; imgIdx < numImages; imgIdx++) {
    const image = new Array(rows);
    for (let row = 0; row < rows; row++) {
      const imgRow = new Array(cols);
      for (let col = 0; col < cols; col++) {
        imgRow[col] = Math.round(imageBin[imagePtr++] / 255);
      };
      image[row] = imgRow;
    };

    const newImage = new Array(cols).fill(0)
      .map(() => new Array(rows).fill(0));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newImage[col][row] = [image[row][col]];
      };
    };

    const label = new Array(26).fill(0);
    label[labelsBin[labelPtr++] - 1] = 1;

    yield {
      xs: newImage,
      ys: label
    };
  };
};

