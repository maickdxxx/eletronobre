const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,79}$/;
const RESERVED_PREVIEW_PATHS = new Set([
  "assets",
  "static",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "preview",
  "site-preview",
]);

export function resolveCorujaPreviewBasePath({ hostname = "", pathname = "/" } = {}) {
  const parts = String(pathname || "/").split("/").filter(Boolean);
  const first = parts[0];
  const second = parts[1];

  if ((first === "preview" || first === "site-preview") && second && SLUG_PATTERN.test(second)) {
    return `/${first}/${second}`;
  }

  if (hostname === "preview.corujahost.com.br" || hostname.startsWith("preview.")) {
    if (first && !RESERVED_PREVIEW_PATHS.has(first) && SLUG_PATTERN.test(first)) return `/${first}`;
  }

  return "";
}

export function getCorujaPreviewBasePath() {
  if (typeof window === "undefined") return "";
  const injected = window.__CORUJA_PREVIEW_BASE_PATH__;
  if (typeof injected === "string" && injected.trim()) {
    const normalized = `/${injected.replace(/^\/+|\/+$/g, "")}`;
    return normalized === "/" ? "" : normalized;
  }
  return resolveCorujaPreviewBasePath({
    hostname: window.location.hostname,
    pathname: window.location.pathname || "/",
  });
}

export function withCorujaPreviewBasePath(path = "/") {
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:|#)/i.test(path)) return path;
  const base = getCorujaPreviewBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  if (normalized === base || normalized.startsWith(`${base}/`)) return normalized;
  return normalized === "/" ? base : `${base}${normalized}`;
}

export function getCorujaRoute() {
  if (typeof window === "undefined") return "/";
  let pathname = window.location.pathname || "/";
  const base = getCorujaPreviewBasePath();
  if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
    pathname = pathname.slice(base.length) || "/";
  }
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
}

export function resolveCorujaAssetUrl(value, fallback = "") {
  const selected = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (!selected) return "";
  if (/^(https?:|data:|blob:|\/\/)/i.test(selected)) return selected;

  const injectedBase = typeof window !== "undefined"
    ? window.__CORUJA_PREVIEW_ASSETS_BASE__
    : "";
  if (typeof injectedBase === "string" && injectedBase.trim()) {
    const cleanBase = injectedBase.replace(/\/+$/, "");
    const cleanPath = selected
      .replace(/^\/+/, "")
      .replace(/^public\//, "")
      .replace(/^src\//, "")
      .replace(/^coruja-template\//, "");
    return `${cleanBase}/${cleanPath}`;
  }

  return withCorujaPreviewBasePath(selected);
}
