import type postsSummaries from "../../tools/posts-summaries.json";

export type Theme = "dark" | "light";
export type PostSummary = (typeof postsSummaries)[number];
export type ThemeContextType = Theme;
