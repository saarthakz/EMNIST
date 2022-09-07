import fs from "node:fs";
import * as tf from "@tensorflow/tfjs-node";

export default function* (type: string) {

  const imageBin = fs.readFileSync(`Dataset/emnist-balanced-${type}-images`);
  const labelsBin = fs.readFileSync(`Dataset/emnist-balanced-${type}-labels`);

  const numImages = imageBin.readUInt32BE(4);
  const rows = imageBin.readUInt32BE(8);
  const cols = imageBin.readUInt32BE(12);

  let imagePtr = 16;
  let labelPtr = 8;

  for (let imgIdx = 0; imgIdx < numImages; imgIdx++) {
    const image: number[][] = new Array(rows);
    for (let row = 0; row < rows; row++) {
      const imgRow: number[] = new Array(cols);
      for (let col = 0; col < cols; col++) {
        imgRow[col] = imageBin[imagePtr++];
      };
      image[row] = imgRow;
    };
    const tensor = tf.tensor2d(image)
      .transpose()
      .div(255)
      .reshape([rows, cols, 1]);

    const label = tf.oneHot(labelsBin[labelPtr], 47);

    yield {
      xs: tensor,
      ys: label
    };
  };

}