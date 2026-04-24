type ConnectionInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: ConnectionInformation;
};

const warmedRoutes = new Set<string>();
const warmedImages = new Set<string>();
const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"]);

function getConnection() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (navigator as NavigatorWithConnection).connection;
}

export function canWarmResources() {
  if (typeof window === "undefined") {
    return false;
  }

  const connection = getConnection();
  if (connection?.saveData) {
    return false;
  }

  if (connection?.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) {
    return false;
  }

  return true;
}

export function warmRoute(
  href: string,
  prefetch: (href: string) => void | Promise<void>,
) {
  if (!href || !href.startsWith("/") || !canWarmResources()) {
    return false;
  }

  if (warmedRoutes.has(href)) {
    return false;
  }

  warmedRoutes.add(href);
  void prefetch(href);
  return true;
}

export function warmImage(src?: string | null) {
  if (!src || !canWarmResources()) {
    return false;
  }

  if (warmedImages.has(src)) {
    return false;
  }

  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
  warmedImages.add(src);
  return true;
}

export function warmImages(
  sources: Array<string | null | undefined>,
  limit = 2,
) {
  if (!canWarmResources() || limit <= 0) {
    return 0;
  }

  let warmedCount = 0;

  for (const source of sources) {
    if (warmedCount >= limit) {
      break;
    }

    if (source && warmImage(source)) {
      warmedCount += 1;
    }
  }

  return warmedCount;
}
