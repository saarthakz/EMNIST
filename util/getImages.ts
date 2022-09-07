import fs from "node:fs";

export default function (binPath: string, maxCount = Infinity) {
  const bin = fs.readFileSync(binPath);

  let ptr = 4;
  const numImages = bin.readUInt32BE(ptr);
  const imgCount = Math.min(maxCount, numImages);
  ptr += 4;
  const rows = bin.readUInt32BE(ptr);
  ptr += 4;
  const cols = bin.readUInt32BE(ptr);
  ptr++;

  const images: number[][][] = new Array(imgCount);

  for (let imgIdx = 0; imgIdx < imgCount; imgIdx++) {
    const image: number[][] = new Array(rows);
    for (let row = 0; row < rows; row++) {
      const imageRow: number[] = new Array(cols);
      for (let col = 0; col < cols; col++) {
        imageRow[col] = bin[ptr++] / 255;
      };
      image[row] = imageRow;
    };
    images[imgIdx] = image;
  };

  return images;
};