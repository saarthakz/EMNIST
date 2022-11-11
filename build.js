import { build } from "esbuild";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function getFilesRecursive(directory, files) {
  const filesInDirectory = readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = join(directory, file);
    if (statSync(absolute).isDirectory()) {
      getFilesRecursive(absolute, files);
    } else {
      files.push(absolute);
    };
  };
};

async function transpile() {
  const paths = [];
  getFilesRecursive("src", paths);

  await build({
    entryPoints: paths,
    bundle: false,
    format: "esm",
    outdir: "build"
  });

};

transpile();
