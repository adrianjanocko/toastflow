const fs = require("node:fs");
const path = require("node:path");

const repoBlobBase = "https://github.com/adrianjanocko/toastflow/blob/main/";
const repoRawBase =
  "https://raw.githubusercontent.com/adrianjanocko/toastflow/main/";

const rootDir = path.resolve(__dirname, "..");
const rootReadmePath = path.join(rootDir, "README.md");
const vuePackageReadmePath = path.join(rootDir, "packages", "vue", "README.md");

let markdown = fs.readFileSync(rootReadmePath, "utf8");

// Rewrite relative assets/links so they work on npm
markdown = markdown
  // images in markdown
  .replace(
    /(]\()(images\/[^)]+)\)/g,
    (_, prefix, rel) => `${prefix}${repoRawBase}${rel})`,
  )
  // images in HTML
  .replace(
    /(src|href)="(images\/[^"]+)"/g,
    (_, attr, rel) => `${attr}="${repoRawBase}${rel}"`,
  )
  // packages links in markdown
  .replace(
    /(]\()(packages\/[^)]+)\)/g,
    (_, prefix, rel) => `${prefix}${repoBlobBase}${rel})`,
  )
  // packages links in HTML
  .replace(
    /href="(packages\/[^"]+)"/g,
    (_, rel) => `href="${repoBlobBase}${rel}"`,
  );

fs.writeFileSync(vuePackageReadmePath, markdown);
console.log(`README synced -> ${vuePackageReadmePath}`);
