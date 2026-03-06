export function resolveApiRequestUrl(
  apiBaseUrl: string,
  apiPath: string,
): string {
  const baseUrl = new URL(apiBaseUrl);
  const normalizedApiPath = normalizeApiPath(apiPath);
  const normalizedBasePath = trimTrailingSlash(baseUrl.pathname);

  const resolvedPath =
    normalizedBasePath.endsWith("/api") &&
    (normalizedApiPath === "/api" || normalizedApiPath.startsWith("/api/"))
      ? `${normalizedBasePath}${normalizedApiPath.slice("/api".length)}`
      : `${normalizedBasePath}${normalizedApiPath}`;

  baseUrl.pathname = resolvedPath || "/";
  baseUrl.search = "";
  baseUrl.hash = "";
  return baseUrl.toString();
}

function normalizeApiPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function trimTrailingSlash(pathname: string): string {
  if (pathname === "/") {
    return "";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
