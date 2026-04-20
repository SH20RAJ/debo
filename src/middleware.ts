import { auth } from "@/lib/auth";
import { nextAppMiddleware } from "better-auth/next-js";

export default nextAppMiddleware(async (request) => {
    // If you need custom logic, you can add it here.
    // By default, this middleware handles session cookies and CSRF.
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
