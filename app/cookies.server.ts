import { createCookie } from "@remix-run/cloudflare"; // or cloudflare/deno

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week
  httpOnly: true,
});
