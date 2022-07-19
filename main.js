import liveServer from "live-server";
import fs from "fs";
import path from "path";
import sass from "sass";
import chalk from "chalk";

const folder = `./public/scss`;
let lastUpdate = 0;

const mainFiles = [];

const main = async () => {
  liveServer.start({
    port: 8080,
    root: "public",
    ignore: "scss",
    logLevel: 2,
    middleware: [
      function (_req, _res, next) {
        next();
      },
    ],
    open: false,
  });

  watch("./public/scss");
};

main();

function watch(folder) {
  fs.readdirSync(folder).forEach((filename) => {
    if (fs.statSync(path.join(folder, filename)).isDirectory()) {
      watch(path.join(folder, filename));
    } else {
      if (filename.endsWith(".scss") && !filename.startsWith("_")) {
        mainFiles.push(path.join(folder, filename));
      }

      compileStyle(folder);
    }
  });

  fs.watch(folder, (_event, filename) => {
    if (filename.endsWith(".scss") && !filename.startsWith("_")) {
      mainFiles.push(path.join(folder, filename));
    }

    compileStyle(folder);
  });
}

function compileStyle(folder) {
  if (lastUpdate > Date.now() - 100) return;
  lastUpdate = Date.now();

  for (const filename of mainFiles) {
    try {
      const result = sass.compile(filename, {
        style: "compressed",
        sourceMap: true,
      });

      fs.writeFileSync(filename.replace(/scss/g, "css"), result.css);

      fs.writeFileSync(
        filename.replace(/scss/g, "css").replace(".css", ".map.css"),
        JSON.stringify(result.sourceMap)
      );

      console.log(`Compiled ${filename}`);
    } catch (e) {
      console.error(
        chalk.red(
          `Error while compiling ${filename}\n${String(e).split("public")[0]}`
        )
      );
    }
  }
}
