import fs from "node:fs";
import * as tf from "@tensorflow/tfjs-node";
export default function* () {
    const imageBin = fs.readFileSync(`data/emnist-letters-test-images`);
    const labelsBin = fs.readFileSync(`data/emnist-letters-test-labels`);
    let numImages = imageBin.readUInt32BE(4);
    const rows = imageBin.readUInt32BE(8);
    const cols = imageBin.readUInt32BE(12);
    let imagePtr = 16;
    let labelPtr = 8;
    const images = new Array(numImages);
    for (let imgIdx = 0; imgIdx < numImages; imgIdx++) {
        const image = new Array(rows);
        for (let row = 0; row < rows; row++) {
            const imgRow = new Array(cols);
            for (let col = 0; col < cols; col++) {
                imgRow[col] = imageBin[imagePtr++];
            }
            ;
            image[row] = imgRow;
        }
        ;
        const tensor = tf.tensor2d(image)
            .transpose()
            .div(255)
            .reshape([rows, cols, 1]);
        const label = tf.oneHot(labelsBin[labelPtr++], 26);
        yield {
            xs: tensor,
            ys: label
        };
    }
    ;
}
;
