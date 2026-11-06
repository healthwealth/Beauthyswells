import { copyFile, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const publicFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "dressing-guide.css",
  "dressing-guide.js",
  "sample-portraits.css",
  "manus-routes.json",
  "favicon.svg",
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const filename of publicFiles) {
  await copyFile(path.join(root, filename), path.join(outputDirectory, filename));
}

const manifest = JSON.parse(
  await readFile(path.join(outputDirectory, "manus-routes.json"), "utf8"),
);
if (!Array.isArray(manifest.routes) || !manifest.routes.some((route) => route.path === "/")) {
  throw new Error("The website route manifest must declare the home page.");
}

const builtIndex = await readFile(path.join(outputDirectory, "index.html"), "utf8");
if (builtIndex.includes("shopify-config.js") || builtIndex.includes("shopify-store.js")) {
  throw new Error("The Shopify-free page must not load the dormant storefront client or config.");
}

const outputFiles = await readdir(outputDirectory);
if (outputFiles.includes("shopify-config.js") || outputFiles.includes("shopify-store.js")) {
  throw new Error("The Shopify-free build must not publish storefront files.");
}

console.log(`Built the Shopify-free static site (${publicFiles.length} public files).`);
