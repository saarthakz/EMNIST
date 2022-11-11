import fs from "node:fs";
import * as tf from "@tensorflow/tfjs-node";
import getSum from "./util/getSum.js";
import getDivisionLines from "./util/getDivisionLines.js";
import { map } from "./map.js";

(async () => {
  // const model = await tf.loadLayersModel("file://models/Letters-Model/model.json");
  const model = await tf.loadLayersModel("file://models/Balanced-Model/model.json");
  const sampleFilePath = "samples/6.png";
  const image = fs.readFileSync(sampleFilePath);
  const imageTensor3D = tf.node.decodePng(image, 1);
  const newShape = imageTensor3D.shape;
  newShape.pop();
  const imageTensor2D = imageTensor3D.reshape(newShape).div(tf.scalar(255)).round().sub(tf.scalar(1)).mul(tf.scalar(-1));
  let imageArr = imageTensor2D.arraySync();
  tf.dispose(imageTensor3D);

  const horSumArr = new Array(imageArr.length);
  for (let row = 0; row < imageArr.length; row++) {
    horSumArr[row] = getSum(imageArr[row]);
  }

  const horDivIndices = getDivisionLines(horSumArr);

  for (let idx = 0; idx < horDivIndices.length - 1; idx += 2) {
    const currImageRow = imageArr.slice(horDivIndices[idx], horDivIndices[idx + 1]);
    const verSumArr = new Array(currImageRow[0].length);
    const rowTensors = [];

    //Vertical Summation of Pixels
    for (let col = 0; col < currImageRow[0].length; col++) {
      let sum = 0;
      for (let row = 0; row < currImageRow.length; row++) {
        sum += currImageRow[row][col];
      };
      verSumArr[col] = sum;
    };

    const verDivisionIndices = getDivisionLines(verSumArr);

    for (let _idx = 0; _idx < verDivisionIndices.length - 1; _idx += 2) {
      const image = currImageRow.map((row) => {
        return row.slice(verDivisionIndices[_idx], verDivisionIndices[_idx + 1] + 1);
      });

      let imageTensor = tf.tensor2d(image, [image.length, image[0].length]).reshape([image.length, image[0].length, 1]);
      imageTensor = imageTensor.
        resizeBilinear([28, 28])
        .round();
      rowTensors.push(imageTensor);
    };

    const xs = tf.stack(rowTensors);
    const predictions = model.predict(xs).arraySync();
    const results = predictions.map((prediction) => {
      const largest = Math.max(...prediction);
      return prediction.findIndex((elem) => elem == largest);
    });
    // console.log(results.map((idx) => String.fromCharCode(idx + 65)).join(""));
    console.log(results.map((elem) => map[elem]).join(""));
  };
})();