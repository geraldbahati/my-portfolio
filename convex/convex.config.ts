import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import r2 from "@convex-dev/r2/convex.config";

const app = defineApp();
app.use(resend);
app.use(rateLimiter);
app.use(r2);

export default app;
