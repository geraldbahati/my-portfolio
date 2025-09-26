import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(resend);
app.use(rateLimiter);

export default app;
