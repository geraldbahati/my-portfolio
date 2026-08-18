import { SITE_URL } from "./constants";

export function toAbsoluteSiteUrl(value: string) {
  return new URL(value, `${SITE_URL}/`).toString();
}

export function canonicalUrl(path: string) {
  if (path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
