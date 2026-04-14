interface JsonLdScriptProps {
  data: unknown;
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return <script type="application/ld+json">{serializeJsonLd(data)}</script>;
}
