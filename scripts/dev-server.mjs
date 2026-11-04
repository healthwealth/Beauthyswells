import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  readPublicStorefrontConfig,
  renderPublicStorefrontConfig,
} from "./storefront-config.mjs";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("The configured Preview port is invalid.");
}

const publicFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/script.js", ["script.js", "text/javascript; charset=utf-8"]],
  ["/dressing-guide.css", ["dressing-guide.css", "text/css; charset=utf-8"]],
  ["/dressing-guide.js", ["dressing-guide.js", "text/javascript; charset=utf-8"]],
  ["/sample-portraits.css", ["sample-portraits.css", "text/css; charset=utf-8"]],
  ["/shopify-store.js", ["shopify-store.js", "text/javascript; charset=utf-8"]],
  ["/manus-routes.json", ["manus-routes.json", "application/json; charset=utf-8"]],
  ["/favicon.svg", ["favicon.svg", "image/svg+xml"]],
]);

function sendText(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    sendText(response, 400, "Bad request");
    return;
  }

  if (pathname === "/shopify-config.js") {
    try {
      const config = readPublicStorefrontConfig();
      const body = renderPublicStorefrontConfig(config);
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      sendText(response, 503, "Shopify storefront configuration is unavailable.");
    }
    return;
  }

  const entry = publicFiles.get(pathname);
  if (!entry) {
    sendText(response, 404, "Not found");
    return;
  }

  try {
    const filename = path.join(root, entry[0]);
    const body = await readFile(filename);
    response.writeHead(200, {
      "Content-Type": entry[1],
      "Cache-Control": entry[0] === "index.html" ? "no-store" : "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    sendText(response, 500, "The requested site asset could not be served.");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Beauthy Swells Preview server listening on 0.0.0.0:${port}`);
});
