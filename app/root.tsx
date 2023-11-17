import { cssBundleHref } from "@remix-run/css-bundle";
import { json } from "@remix-run/cloudflare";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import styles from "./globals.css";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { userPrefs } from "./cookies.server";
import type { Theme } from "./utils/typs";
import { useMemo } from "react";
import { ThemeProvider } from "./context/theme";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

function useTheme(theme: Theme) {
  const fetcher = useFetcher();

  const optimisticTheme = fetcher.formData
    ? (fetcher.formData.get("theme") as Theme)
    : theme;

  const ThemeSwitcher = useMemo(() => {
    return function ThemeSwitcher() {
      return (
        <fetcher.Form method="post">
          <input
            type="hidden"
            name="theme"
            value={optimisticTheme === "dark" ? "light" : "dark"}
          />
          <button type="submit" className="">
            {optimisticTheme === "light" ? "🌙" : "🌞"}
          </button>
        </fetcher.Form>
      );
    };
  }, [fetcher, optimisticTheme]);

  return { optimisticTheme, ThemeSwitcher };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  return json({ theme: (cookie.theme as Theme) || "dark" });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme") as Theme;
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  cookie.theme = theme;

  return new Response(null, {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export default function App() {
  const { optimisticTheme: theme, ThemeSwitcher } = useTheme(
    useLoaderData<typeof loader>().theme
  );

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="w-full p-4 text-5xl flex content-between">
          CtCtkLfh's Blog
          <ThemeSwitcher />
        </header>
        <main>
          <ThemeProvider value={theme}>
            <Outlet />
          </ThemeProvider>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
