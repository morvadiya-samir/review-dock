import { NextRequest, NextResponse } from "next/server";

// ============================================================
// SSRF Protection: Block private/local IP ranges
// ============================================================
const BLOCKED_PATTERNS = [
    /^localhost$/i,
    /^127\.\d+\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^::1$/,
    /^0\.0\.0\.0$/,
];

function isSafeUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        if (!["http:", "https:"].includes(url.protocol)) return false;
        const hostname = url.hostname;
        return !BLOCKED_PATTERNS.some((pattern) => pattern.test(hostname));
    } catch {
        return false;
    }
}

// ============================================================
// Rewrite URLs in HTML attributes to absolute paths
// ============================================================
function rewriteUrls(html: string, baseUrl: string): string {
    const base = new URL(baseUrl);
    const origin = base.origin;
    const basePath = base.href.substring(0, base.href.lastIndexOf("/") + 1);

    // Rewrite href, src, action, srcset attributes
    return html
        .replace(
            /(href|src|action)=["']([^"']+)["']/gi,
            (match, attr, value) => {
                if (
                    value.startsWith("http://") ||
                    value.startsWith("https://") ||
                    value.startsWith("data:") ||
                    value.startsWith("//") ||
                    value.startsWith("javascript:") ||
                    value.startsWith("#") ||
                    value.startsWith("mailto:")
                ) {
                    if (value.startsWith("//")) {
                        return `${attr}="${base.protocol}${value}"`;
                    }
                    return match;
                }
                if (value.startsWith("/")) {
                    return `${attr}="${origin}${value}"`;
                }
                return `${attr}="${basePath}${value}"`;
            }
        )
        .replace(
            /srcset=["']([^"']+)["']/gi,
            (_, srcsetValue) => {
                const rewritten = srcsetValue.replace(
                    /([^\s,]+)(\s[^,]*)?(,|$)/g,
                    (m: string, url: string, descriptor: string, sep: string) => {
                        if (
                            url.startsWith("http://") ||
                            url.startsWith("https://") ||
                            url.startsWith("data:")
                        ) {
                            return m;
                        }
                        const abs = url.startsWith("/")
                            ? `${origin}${url}`
                            : `${basePath}${url}`;
                        return `${abs}${descriptor || ""}${sep}`;
                    }
                );
                return `srcset="${rewritten}"`;
            }
        )
        // Rewrite CSS url() references
        .replace(/url\(["']?(?!data:|http|https)([^"')]+)["']?\)/gi, (match, path) => {
            if (path.startsWith("/")) return `url("${origin}${path}")`;
            return `url("${basePath}${path}")`;
        });
}

// ============================================================
// Review mode script injection
// ============================================================
const REVIEW_SCRIPT = `
<script>
(function() {
  if (window.__reviewDockInjected) return;
  window.__reviewDockInjected = true;

  // Prevent all default navigation
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // Hover highlighting
  var lastHighlighted = null;
  document.addEventListener('mousemove', function(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el === lastHighlighted) return;
    if (lastHighlighted) {
      lastHighlighted.style.outline = '';
      lastHighlighted.style.outlineOffset = '';
      lastHighlighted.style.cursor = '';
    }
    if (el && el !== document.body && el !== document.documentElement) {
      el.style.outline = '2px dashed #6366f1';
      el.style.outlineOffset = '2px';
      el.style.cursor = 'crosshair';
      lastHighlighted = el;

      window.parent.postMessage({
        type: 'ELEMENT_HOVER',
        data: {
          tagName: el.tagName,
          textContent: (el.textContent || '').trim().substring(0, 100),
          selector: generateSelector(el),
          rect: JSON.parse(JSON.stringify(el.getBoundingClientRect()))
        }
      }, '*');
    }
  });

  // Click to add comment
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    window.parent.postMessage({
      type: 'ELEMENT_CLICK',
      data: {
        tagName: el.tagName,
        textContent: (el.textContent || '').trim().substring(0, 500),
        selector: generateSelector(el),
        rect: JSON.parse(JSON.stringify(el.getBoundingClientRect())),
        x: e.clientX,
        y: e.clientY
      }
    }, '*');
  }, true);

  // CSS Selector Generator
  function generateSelector(el) {
    if (el.id) return '#' + el.id;
    var path = [];
    var current = el;
    while (current && current !== document.body) {
      var selector = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        var classes = current.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3);
        if (classes.length) selector += '.' + classes.join('.');
      }
      var parent = current.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children);
        var index = siblings.indexOf(current);
        selector += ':nth-child(' + (index + 1) + ')';
      }
      path.unshift(selector);
      current = parent;
    }
    return path.join(' > ');
  }

  // Notify parent that iframe loaded in review mode
  window.addEventListener('load', function() {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  });

  // Track comments and sync their positions
  var activeComments = [];
  
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SYNC_COMMENTS') {
      activeComments = e.data.comments || [];
      updateCommentPositions();
    }
  });

  function updateCommentPositions() {
    if (!activeComments || activeComments.length === 0) return;
    var positions = {};
    activeComments.forEach(function(c) {
      if (!c.elementSelector) return;
      try {
        var el = document.querySelector(c.elementSelector);
        if (el) {
          positions[c.id] = JSON.parse(JSON.stringify(el.getBoundingClientRect()));
        }
      } catch(e) {}
    });
    window.parent.postMessage({ type: 'COMMENTS_POSITIONS', positions: positions }, '*');
  }

  // Update positions on scroll and resize
  window.addEventListener('scroll', updateCommentPositions, true);
  window.addEventListener('resize', updateCommentPositions);
  
  // Create a MutationObserver to catch layout reflows and dynamic additions
  var observer = new MutationObserver(function() {
    updateCommentPositions();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

})();
</script>
`;

const REVIEW_STYLES = `
<style id="review-dock-styles">
  * { box-sizing: border-box; }
  body { cursor: default; }
</style>
`;

// ============================================================
// Main proxy handler
// ============================================================
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const mode = searchParams.get("mode") ?? "preview"; // "preview" | "review"

    if (!targetUrl) {
        return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
    }

    let decodedUrl: string;
    try {
        decodedUrl = decodeURIComponent(targetUrl);
    } catch {
        return NextResponse.json({ error: "Invalid URL encoding" }, { status: 400 });
    }

    if (!isSafeUrl(decodedUrl)) {
        return NextResponse.json(
            { error: "URL is not allowed. Only public http/https URLs are permitted." },
            { status: 403 }
        );
    }

    try {
        const response = await fetch(decodedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "identity", // avoid gzip so we can parse text directly
            },
            redirect: "follow",
            signal: AbortSignal.timeout(15000), // 15s timeout
        });

        const contentType = response.headers.get("content-type") ?? "";

        // Only proxy HTML content
        if (!contentType.includes("text/html")) {
            // For non-HTML content (CSS, JS, images), redirect directly
            return NextResponse.redirect(decodedUrl);
        }

        let html = await response.text();

        // 1. Rewrite relative URLs to absolute
        const finalUrl = response.url || decodedUrl;
        html = rewriteUrls(html, finalUrl);

        // 2. In review mode, inject script + styles before </head> or at start
        if (mode === "review") {
            if (html.includes("</head>")) {
                html = html.replace("</head>", `${REVIEW_STYLES}${REVIEW_SCRIPT}</head>`);
            } else if (html.includes("<body")) {
                html = html.replace("<body", `${REVIEW_STYLES}${REVIEW_SCRIPT}<body`);
            } else {
                html = REVIEW_STYLES + REVIEW_SCRIPT + html;
            }
        }

        // 3. Build response with iframe-friendly headers
        const headers = new Headers();
        headers.set("Content-Type", "text/html; charset=utf-8");
        headers.set("X-Content-Type-Options", "nosniff");
        // Allow the response to be framed on our own origin
        headers.set("X-Frame-Options", "SAMEORIGIN");
        // Cache preview responses for 60s, skip cache for review mode (scripts injected)
        headers.set(
            "Cache-Control",
            mode === "review" ? "no-store" : "public, max-age=60, stale-while-revalidate=300"
        );

        return new NextResponse(html, { status: 200, headers });
    } catch (error: unknown) {
        console.error("[PROXY_ERROR]", error);

        if (error instanceof Error) {
            if (error.name === "TimeoutError" || error.message.includes("timeout")) {
                return NextResponse.json(
                    { error: "The target website took too long to respond (15s timeout)." },
                    { status: 504 }
                );
            }
            if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNREFUSED")) {
                return NextResponse.json(
                    { error: "Could not reach the target website. Please check the URL." },
                    { status: 502 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch the target website." },
            { status: 500 }
        );
    }
}
