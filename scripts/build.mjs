import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  readPublicStorefrontConfig,
  renderPublicStorefrontConfig,
} from "./storefront-config.mjs";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const publicFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "shopify-store.js",
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

const config = readPublicStorefrontConfig();
await writeFile(
  path.join(outputDirectory, "shopify-config.js"),
  renderPublicStorefrontConfig(config),
  "utf8",
);

const builtIndex = await readFile(path.join(outputDirectory, "index.html"), "utf8");
if (!builtIndex.includes("./shopify-config.js") || !builtIndex.includes("./shopify-store.js")) {
  throw new Error("The built page must load the Shopify storefront configuration and client.");
}

console.log(`Built the static site and generated the public Shopify storefront configuration (${publicFiles.length} site files).`);
