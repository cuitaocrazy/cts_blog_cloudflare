import { Outlet, useLoaderData } from "@remix-run/react";
import githubStyles from "highlight.js/styles/github.min.css";
import githubDarkStyles from "highlight.js/styles/github-dark.css";
import katexStyles from "katex/dist/katex.css";
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import posts from "../../tools/posts-summaries.json";
import { cva } from "class-variance-authority";
import { useTheme } from "~/context/theme";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const slug = parts[parts.length - 1];
  const post = posts.find((p) => p.slug === slug);
  return json(post);
}

const markdownStyles = cva(
  "prose prose-xl prose-pre:p-0 prose-pre:border prose-pre:bg-inherit m-auto px-2 sm:px-0",
  {
    variants: {
      theme: {
        light: "",
        dark: "prose-invert",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

export default function Posts() {
  const post = useLoaderData<typeof loader>();
  const theme = useTheme();

  return (
    <section className="py-8 sm:py-16 lg:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <p className="text-muted-foreground">{`${post.date} ~ ${post.estimatedReadTime} min read`}</p>
          <h1 className="text-5xl font-bold">{post.title}</h1>
        </header>
        <img
          src={post.image}
          alt="博客文章的主题图片"
          className="w-full aspect-video mb-8"
        />
        <div className={markdownStyles({ theme: theme })}>
          <link
            rel="stylesheet"
            href={theme === "light" ? githubStyles : githubDarkStyles}
          />
          <link rel="stylesheet" href={katexStyles} />
          <Outlet />
        </div>
      </article>
    </section>
  );
}
