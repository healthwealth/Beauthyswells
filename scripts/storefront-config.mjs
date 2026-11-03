const API_VERSION = "2026-10";

function canonicalHttpsHostname(rawDomain) {
  const value = String(rawDomain || "").trim();
  if (!value) {
    throw new Error("Shopify storefront domain is not configured.");
  }

  let parsed;
  try {
    parsed = new URL(/^https:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    throw new Error("Shopify storefront domain is invalid.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const labels = hostname.split(".");
  const validHostname =
    parsed.protocol === "https:" &&
    !parsed.username &&
    !parsed.password &&
    !parsed.port &&
    (parsed.pathname === "/" || parsed.pathname === "") &&
    !parsed.search &&
    !parsed.hash &&
    hostname.length <= 253 &&
    labels.length >= 2 &&
    labels.every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
    );

  if (!validHostname) {
    throw new Error("Shopify storefront domain is invalid.");
  }

  return hostname;
}

export function readPublicStorefrontConfig(env = process.env) {
  const shopDomain = canonicalHttpsHostname(env.SHOPIFY_STORE_DOMAIN);
  const storefrontAccessToken = String(
    env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  ).trim();

  if (!storefrontAccessToken) {
    throw new Error("Shopify public Storefront API token is not configured.");
  }

  return {
    shopDomain,
    storefrontAccessToken,
    apiVersion: API_VERSION,
  };
}

export function renderPublicStorefrontConfig(config) {
  // This is the public Storefront token by design; never pass an Admin token here.
  const safeConfig = {
    shopDomain: config.shopDomain,
    storefrontAccessToken: config.storefrontAccessToken,
    apiVersion: config.apiVersion,
  };
  return `window.BEAUTHY_SHOPIFY_CONFIG = Object.freeze(${JSON.stringify(safeConfig)});\n`;
}
