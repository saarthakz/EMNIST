import { createWorker } from 'tesseract.js';
import { join } from 'path';

const worker = createWorker({

});

(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize("samples/6.png");
  console.log(text);
  await worker.terminate();
})();