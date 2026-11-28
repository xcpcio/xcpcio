const FALLBACK_ORIGIN = "http://localhost";

function getOrigin(origin?: string) {
  if (origin) {
    return origin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return FALLBACK_ORIGIN;
}

function trimTrailingSlashes(path: string) {
  return path.replace(/\/+$/, "");
}

/**
 * Join a locale base URL with a base-free route path (`route.fullPath`),
 * preserving the query string and hash.
 */
export function buildLocaleUrl(base: string, fullPath: string, origin?: string) {
  const target = new URL(base || "/", getOrigin(origin));
  const basePath = `${trimTrailingSlashes(target.pathname)}/`;

  const [pathAndQuery, hash = ""] = fullPath.split("#");
  const [path, query = ""] = pathAndQuery.split("?");

  target.pathname = `${basePath}${path.replace(/^\/+/, "")}`;
  target.search = query
    ? `?${query}`
    : "";
  target.hash = hash
    ? `#${hash}`
    : "";

  return target.href;
}

/**
 * Find the locale whose base path contains the current pathname. Used on
 * startup so a direct `/zh/board/...` link is deterministic even when the
 * deployment default is not injected.
 */
export function findLocaleForPath(
  localeUrls: Record<string, string> | undefined,
  pathname: string,
  origin?: string,
) {
  if (!localeUrls) {
    return undefined;
  }

  const resolvedOrigin = getOrigin(origin);
  const currentHost = new URL(resolvedOrigin).host;
  let matched: { locale: string; length: number } | undefined;

  for (const [locale, base] of Object.entries(localeUrls)) {
    let target: URL;
    try {
      target = new URL(base, resolvedOrigin);
    } catch {
      continue;
    }

    // A locale base on another host (for example board.xcpcio.com pointing at
    // the apex locale URLs) must not override the deployment's default locale.
    if (target.host !== currentHost) {
      continue;
    }

    const basePath = trimTrailingSlashes(target.pathname);
    if (!basePath) {
      continue;
    }

    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
      if (!matched || basePath.length > matched.length) {
        matched = { locale, length: basePath.length };
      }
    }
  }

  return matched?.locale;
}
