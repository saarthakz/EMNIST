import * as tf from "@tensorflow/tfjs-node";
import model from "./util/model";
import generator from "./util/generator";

(async () => {

  model.summary();

  //112800
  const trainingDataset = tf.data.generator(() => generator("train"))
    .batch(10)
    .shuffle(10);

  //18800
  const testDataset = tf.data.generator(() => generator("test"))
    .batch(10);

  await model.fitDataset(trainingDataset, {
    epochs: 5,
    validationData: testDataset,
  });

  await model.save("file://Model/NN");

})();