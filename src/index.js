import * as tf from "@tensorflow/tfjs-node";
import generator from "./generator.js";
import model from "./model.js";

model.summary();

//124800
const trainingDataset = tf.data.generator(() => generator("train"))
  .shuffle(124800)
  .batch(200);

//20800
const testDataset = tf.data.generator(() => generator("test"))
  .batch(200);

await model.fitDataset(trainingDataset, {
  epochs: 1,
  validationData: testDataset,
});

await model.save("file://model/NN");