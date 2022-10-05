
import fs from "node:fs";

const trainDataStream = fs.createReadStream(`data/emnist-letters-train-images`, {
  highWaterMark: 1
});

let ctr = 0;

let numImages, rows, cols;
let temp = [];

trainDataStream.on("data", function (buff) {

  if (ctr == 4) temp = [];

  if (ctr == 8) {
    console.log(temp);
    numImages = Buffer.from(temp).readUInt32BE(0);
    temp = [];
  };

  if (ctr == 12) {
    console.log(temp);
    rows = Buffer.from(temp).readUInt32BE(0);
    temp = [];
  };

  if (ctr == 16) {
    this.pause();
    cols = Buffer.from(temp).readUInt32BE(0);
    temp = [];
    console.log(numImages, rows, cols);
  };

  temp.push(buff.readUInt8(0));

  ctr++;

});




