import * as tf from "@tensorflow/tfjs-node";
import testGenerator from "./util/testGenerator";
import model from "./util/model";
import trainGenerator from "./util/trainGenerator";

(async () => {

  const trainingDataset = tf.data.generator(trainGenerator)
    .batch(10)
    .shuffle(10);

  const testDataset = tf.data.generator(testGenerator)
    .batch(10);

  await model.fitDataset(trainingDataset, {
    epochs: 5,
    validationData: testDataset,
  });

  await model.save("file://model/NN");

})();