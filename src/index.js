import * as tf from "@tensorflow/tfjs-node";
import model from "./util/model";
import generator from "./util/generator";

(async () => {

  const trainingDataset = tf.data.generator(() => generator("train")).batch(100).shuffle(100);

  const testDataset = tf.data.generator(() => generator("test")).batch(100).shuffle(100);

  await model.fitDataset(trainingDataset, {
    epochs: 5,
    validationData: testDataset,
  });

  await model.save("file://Model/NN");

})();