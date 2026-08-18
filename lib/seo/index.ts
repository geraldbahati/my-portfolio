export {
  PAGE_COPY,
  PERSON,
  PERSON_ID,
  PROFILE_PAGE_ID,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LANGUAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
  WEBSITE_ID,
} from "./constants";
export {
  contactMetadata,
  homeMetadata,
  imprintMetadata,
  pageMetadata,
  privacyMetadata,
  projectsIndexMetadata,
  rootMetadata,
} from "./metadata";
export { canonicalUrl, toAbsoluteSiteUrl } from "./urls";
export {
  contactPageNode,
  faqPageNode,
  generateBreadcrumbSchema,
  generateStructuredData,
  homepageGraph,
  jsonLdGraph,
  personNode,
  profilePageNode,
  projectListNode,
  projectWorkNode,
  websiteNode,
} from "./json-ld";
export type { BreadcrumbItem, FaqEntry, JsonLdNode, ProjectWorkInput } from "./json-ld";
export { renderLlmsTxt } from "./llms-txt";
export type { LlmsTxtProject } from "./llms-txt";
