import { createHmac, randomBytes } from "node:crypto";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 8_192;
const MAX_INQUIRIES_PER_WINDOW = 12;
const MAX_INQUIRIES_PER_ADDRESS_PER_WINDOW = 36;
const RATE_WINDOW_MS = 15 * 60 * 1_000;
const rateSalt = randomBytes(32);
const rateBuckets = new Map();
const allowedTopics = new Set([
  "Skin and body rituals",
  "Virtual try-on",
  "Dressing and personal style",
  "Something else",
]);
const mailboxPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
const forbiddenControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const messageControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function isMailbox(value) {
  return typeof value === "string" && value.length <= 254 && mailboxPattern.test(value);
}

function getConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const recipient = process.env.BEAUTHY_INQUIRY_TO?.trim() || "";
  const sender = process.env.BEAUTHY_EMAIL_FROM?.trim() || "";
  const safeRecipient = isMailbox(recipient) ? recipient : null;

  return {
    ready: Boolean(apiKey && safeRecipient && isMailbox(sender)),
    provider: "Resend",
    recipient: safeRecipient,
  };
}

function isSameOriginBrowserRequest(request) {
  const originHeader = request.headers.origin;
  if (typeof originHeader !== "string") return false;

  let origin;
  try {
    origin = new URL(originHeader);
  } catch {
    return false;
  }

  if (!(["http:", "https:"].includes(origin.protocol)) || origin.origin !== originHeader) {
    return false;
  }

  const fetchSite = request.headers["sec-fetch-site"];
  if (fetchSite && fetchSite !== "same-origin") return false;

  const referer = request.headers.referer;
  if (referer) {
    try {
      if (new URL(referer).origin !== origin.origin) return false;
    } catch {
      return false;
    }
  }

  return true;
}

async function readJsonBody(request) {
  const contentType = String(request.headers["content-type"] || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return { error: { status: 415, code: "unsupported_content_type" } };
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      return { error: { status: 413, code: "request_too_large" } };
    }
    chunks.push(chunk);
  }

  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { error: { status: 400, code: "invalid_request" } };
    }
    return { value };
  } catch {
    return { error: { status: 400, code: "invalid_json" } };
  }
}

function validateInquiry(value) {
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const topic = typeof value.topic === "string" ? value.topic.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const honeypot = typeof value.company_website === "string" ? value.company_website.trim() : "";

  if (honeypot) return { honeypot: true };
  if (
    !name || name.length > 120 || forbiddenControls.test(name) ||
    !isMailbox(email) || forbiddenControls.test(email) ||
    !allowedTopics.has(topic) ||
    !message || message.length > 3_000 || messageControls.test(message)
  ) {
    return { error: { status: 400, code: "invalid_fields" } };
  }

  return { value: { name, email, topic, message } };
}

function sweepRateBuckets(now) {
  for (const [key, timestamps] of rateBuckets) {
    if (!timestamps.length || now - timestamps[timestamps.length - 1] >= RATE_WINDOW_MS) {
      rateBuckets.delete(key);
    }
  }

  while (rateBuckets.size >= 2_048) {
    let oldestKey;
    let oldestTimestamp = Infinity;
    for (const [key, timestamps] of rateBuckets) {
      const firstTimestamp = timestamps[0] ?? now;
      if (firstTimestamp < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = firstTimestamp;
      }
    }
    if (oldestKey === undefined) break;
    rateBuckets.delete(oldestKey);
  }
}

function consumeRateBucket(key, limit, now) {
  const recent = (rateBuckets.get(key) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= limit) {
    rateBuckets.set(key, recent);
    return false;
  }

  if (!rateBuckets.has(key) && rateBuckets.size >= 2_048) sweepRateBuckets(now);
  recent.push(now);
  rateBuckets.set(key, recent);
  return true;
}

function isRateLimited(request, email) {
  const now = Date.now();
  const address = request.socket?.remoteAddress || "unknown";
  const addressKey = createHmac("sha256", rateSalt)
    .update(`address\n${address}`)
    .digest("hex");
  const identityKey = createHmac("sha256", rateSalt)
    .update(`identity\n${address}\n${email.toLowerCase()}`)
    .digest("hex");
  const addressAllowed = consumeRateBucket(addressKey, MAX_INQUIRIES_PER_ADDRESS_PER_WINDOW, now);
  const identityAllowed = consumeRateBucket(identityKey, MAX_INQUIRIES_PER_WINDOW, now);
  return !addressAllowed || !identityAllowed;
}

export async function handleInquiryRequest(request, response) {
  let pathname;
  try {
    pathname = new URL(request.url || "/", "http://localhost").pathname;
  } catch {
    return false;
  }
  if (pathname !== "/api/inquiry") return false;

  if (request.method === "GET") {
    sendJson(response, 200, { ok: true, ...getConfiguration() });
    return true;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { ok: false, error: "method_not_allowed" });
    return true;
  }

  if (!isSameOriginBrowserRequest(request)) {
    sendJson(response, 403, { ok: false, error: "same_origin_required" });
    return true;
  }

  let parsed;
  try {
    parsed = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { ok: false, error: "invalid_request" });
    return true;
  }
  if (parsed.error) {
    sendJson(response, parsed.error.status, { ok: false, error: parsed.error.code });
    return true;
  }

  const validated = validateInquiry(parsed.value);
  if (validated.honeypot) {
    sendJson(response, 202, { ok: true });
    return true;
  }
  if (validated.error) {
    sendJson(response, validated.error.status, { ok: false, error: validated.error.code });
    return true;
  }

  const config = getConfiguration();
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const sender = process.env.BEAUTHY_EMAIL_FROM?.trim() || "";
  if (!config.ready || !config.recipient || !sender) {
    sendJson(response, 503, { ok: false, error: "delivery_not_configured" });
    return true;
  }

  if (isRateLimited(request, validated.value.email)) {
    sendJson(response, 429, { ok: false, error: "rate_limited" });
    return true;
  }

  const { name, email, topic, message } = validated.value;
  const text = [
    "A new inquiry was submitted through the Beauthy Swells Beauty Edit.",
    "",
    `Name: ${name}`,
    `Reply-to: ${email}`,
    `Topic: ${topic}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const providerResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "BeauthySwellsInquiry/1.0",
      },
      body: JSON.stringify({
        from: sender,
        to: [config.recipient],
        reply_to: email,
        subject: `Beauthy Swells inquiry — ${topic}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!providerResponse.ok) {
      try {
        await providerResponse.body?.cancel();
      } catch {
        // The provider response is deliberately not logged or returned to the browser.
      }
      const retryable = providerResponse.status === 429 || providerResponse.status >= 500;
      sendJson(response, retryable ? 503 : 502, {
        ok: false,
        error: retryable ? "delivery_temporarily_unavailable" : "delivery_failed",
      });
      return true;
    }

    sendJson(response, 202, { ok: true });
  } catch {
    sendJson(response, 503, { ok: false, error: "delivery_temporarily_unavailable" });
  }
  return true;
}
