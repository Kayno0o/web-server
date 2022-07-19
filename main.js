import liveServer from "live-server";
import fs from "fs";
import path from "path";
import sass from "sass";
import chalk from "chalk";

const folder = `./public/scss`;
let lastUpdate = 0;

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

  fs.watch(folder, (event, filename) => {
    compileStyle(folder, "main.scss");
  });

  fs.readdirSync(folder).forEach((filename) => {
    compileStyle(folder, "main.scss");
  });
};

main();

function compileStyle(folder, filename) {
  if (lastUpdate > Date.now() - 100) return;
  lastUpdate = Date.now();

  if (filename && filename.endsWith(".scss") && !filename.startsWith("_")) {
    try {
      const result = sass.compile(path.join(folder, filename), {
        style: "compressed",
        sourceMap: true,
      });

      fs.writeFileSync(
        path.join(
          folder.replace("scss", "css"),
          filename.replace(".scss", ".css")
        ),
        result.css
      );

      fs.writeFileSync(
        path.join(
          folder.replace("scss", "css"),
          filename.replace(".scss", ".map.css")
        ),
        JSON.stringify(result.sourceMap)
      );

      console.log(`Compiled ${path.join(folder, filename)}`);
    } catch (e) {
      console.error(
        chalk.red(
          `Error while compiling ${path.join(folder, filename)}\n${
            String(e).split("public")[0]
          }`
        )
      );
    }
  }
}
