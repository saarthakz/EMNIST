import * as tf from "@tensorflow/tfjs-node";

// Creating the model
const model = tf.sequential();
model.add(tf.layers.conv2d({
  inputShape: [28, 28, 1],
  activation: "relu",
  filters: 64,
  kernelSize: 3,
}));
model.add(tf.layers.maxPool2d({
  poolSize: 2,
}));
model.add(tf.layers.conv2d({
  activation: "relu",
  filters: 64,
  kernelSize: 3,
}));
model.add(tf.layers.maxPool2d({
  poolSize: 2,
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
  activation: "relu",
  units: 128,
}));
// model.add(tf.layers.dropout({ rate: 0.25 }));
model.add(tf.layers.dense({
  activation: "softmax",
  // units: 26, //For Letters
  units: 47, //For Balanced
}));

model.compile({
  loss: "categoricalCrossentropy",
  optimizer: tf.train.adam(),
  metrics: ['accuracy']
});

model.summary();

export default model;