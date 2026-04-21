import { Nango } from "@nangohq/node";

const nangoSecretKey = process.env.NANGO_SECRET_KEY;

if (!nangoSecretKey && process.env.NODE_ENV === "production") {
    console.warn("NANGO_SECRET_KEY is not set.");
}

export const nango = new Nango({
    secretKey: nangoSecretKey || "placeholder_secret_key",
});
