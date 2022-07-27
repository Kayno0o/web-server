import liveServer from "live-server";
import fs from "fs";
import path from "path";
import sass from "sass";
import chalk from "chalk";

let waitUpdate;

// Main scss files
const scssFiles = [];

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

  watchScss("./public/assets/scss");
};

main();

function watchScss(folder) {
  fs.readdirSync(folder).forEach((filename) => {
    if (fs.statSync(path.join(folder, filename)).isDirectory()) {
      watchScss(path.join(folder, filename));
    } else {
      if (filename.endsWith(".scss") && !filename.startsWith("_")) {
        scssFiles.push(path.join(folder, filename));
      }

      compileScss();
    }
  });

  fs.watch(folder, () => {
    compileScss();
  });
}

function compileScss() {
  if (waitUpdate) return;
  waitUpdate = setTimeout(() => (waitUpdate = null), 500);

  for (const filename of scssFiles) {
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
