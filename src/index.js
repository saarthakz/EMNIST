import * as tf from "@tensorflow/tfjs-node";
import generator from "./generator.js";
import model from "./model.js";

model.summary();

const trainingDataSize = 124800;
const trainingDataset = tf.data.generator(() => generator("train"))
  .shuffle(trainingDataSize)
  .batch(100);

const testingDataSize = 20800;
const testDataset = tf.data.generator(() => generator("test"))
  .batch(100);

await model.fitDataset(trainingDataset, {
  epochs: 1,
  validationData: testDataset,
});

await model.save("file://model/NN");



