var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as tf from "@tensorflow/tfjs-node";
import testGenerator from "./util/testGenerator";
import model from "./util/model";
import trainGenerator from "./util/trainGenerator";
(() => __awaiter(void 0, void 0, void 0, function* () {
    const trainingDataset = tf.data.generator(trainGenerator)
        .batch(10)
        .shuffle(10);
    const testDataset = tf.data.generator(testGenerator)
        .batch(10);
    yield model.fitDataset(trainingDataset, {
        epochs: 5,
        validationData: testDataset,
    });
    yield model.save("file://model/NN");
}))();
