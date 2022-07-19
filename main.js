// ! launch web server
const liveServer = require("live-server");

const params = {
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
};

liveServer.start(params);

// ! compile sass
const fs = require("fs");
const path = require("path");
const sass = require("sass");

const folder = `${__dirname}/public/scss`;

fs.watch(folder, (event, filename) => {
  compile(folder, filename);
});

fs.readdirSync(folder).forEach((filename) => {
  compile(folder, filename);
});

function compile(folder, filename) {
  if (filename && filename.endsWith(".scss") && !filename.startsWith("_")) {
    console.log(`compiling ${filename}`);

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
  }
}
