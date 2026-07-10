/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminFaqs from "../adminFaqs.js";
import type * as adminProjectChallenges from "../adminProjectChallenges.js";
import type * as adminProjectDetails from "../adminProjectDetails.js";
import type * as adminProjectGallery from "../adminProjectGallery.js";
import type * as adminProjectMetrics from "../adminProjectMetrics.js";
import type * as adminProjectTestimonials from "../adminProjectTestimonials.js";
import type * as adminProjects from "../adminProjects.js";
import type * as auth from "../auth.js";
import type * as contactForm from "../contactForm.js";
import type * as faqs from "../faqs.js";
import type * as http from "../http.js";
import type * as projectAccess from "../projectAccess.js";
import type * as projectChallenges from "../projectChallenges.js";
import type * as projectDetails from "../projectDetails.js";
import type * as projectGallery from "../projectGallery.js";
import type * as projectMetrics from "../projectMetrics.js";
import type * as projectTestimonials from "../projectTestimonials.js";
import type * as projects from "../projects.js";
import type * as r2 from "../r2.js";
import type * as revalidate from "../revalidate.js";
import type * as seedWeblineProjects from "../seedWeblineProjects.js";
import type * as stream from "../stream.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminFaqs: typeof adminFaqs;
  adminProjectChallenges: typeof adminProjectChallenges;
  adminProjectDetails: typeof adminProjectDetails;
  adminProjectGallery: typeof adminProjectGallery;
  adminProjectMetrics: typeof adminProjectMetrics;
  adminProjectTestimonials: typeof adminProjectTestimonials;
  adminProjects: typeof adminProjects;
  auth: typeof auth;
  contactForm: typeof contactForm;
  faqs: typeof faqs;
  http: typeof http;
  projectAccess: typeof projectAccess;
  projectChallenges: typeof projectChallenges;
  projectDetails: typeof projectDetails;
  projectGallery: typeof projectGallery;
  projectMetrics: typeof projectMetrics;
  projectTestimonials: typeof projectTestimonials;
  projects: typeof projects;
  r2: typeof r2;
  revalidate: typeof revalidate;
  seedWeblineProjects: typeof seedWeblineProjects;
  stream: typeof stream;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
};
