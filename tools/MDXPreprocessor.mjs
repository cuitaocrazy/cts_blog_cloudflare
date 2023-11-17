import fs from "fs";
import { parse, stringify } from "yaml";

/**
 * The directory where the routes are stored.
 * @type {string}
 */
const routesDirectory = "./app/routes";

/**
 * The regular expression pattern to match the MDX header.
 * @type {RegExp}
 */
const mdxHeaderPattern = /---\r?\n(.*?)\r?\n---/s;

/**
 * The regular expression pattern to match the post name.
 * @type {RegExp}
 */
const postNamePattern = /posts\.(.*)\.mdx/;

/**
 * An array of MDX files filtered from the routes directory.
 * @type {Array<string>}
 */
const mdxFiles = fs
  .readdirSync(routesDirectory)
  .filter((file) => file.match(/posts.*.mdx/));

/**
 * Formats a date object to a string in the format of "YYYY-MM-DD".
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

/**
 * Estimates the read time of a given text.
 * @param {string} text - The text to estimate the read time for.
 * @returns {number} The estimated read time in minutes.
 */
function estimateReadTime(text) {
  const chineseCharsPerMinute = 350;
  const englishCharsPerMinute = 225;

  const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
  const englishChars = text.match(/[a-zA-Z]/g)?.length || 0;

  const chineseReadTime = Math.ceil(chineseChars / chineseCharsPerMinute);
  const englishReadTime = Math.ceil(englishChars / englishCharsPerMinute);

  return chineseReadTime + englishReadTime;
}

/**
 * @typedef {{
 *  title: string,
 *  date: string,
 *  image: string,
 *  slug: string,
 *  estimatedReadTime: number,
 *  description: string,
 * tags: string[],
 *  }} PostSummary
 */

/**
 * An array of post objects.
 * @type {Array<object>}
 */
const posts = mdxFiles.map((file) => {
  const mdxFile = fs.readFileSync(`${routesDirectory}/${file}`, "utf8");
  const mdxHeaderStr = mdxFile.match(mdxHeaderPattern)[1];
  const mdxHeaderObject = parse(mdxHeaderStr);
  let needRewrite = false;

  /** @type {PostSummary} */
  const postSummary = {};

  postSummary.title =
    mdxHeaderObject.meta.reduce(
      (title, meta) => title || meta["title"],
      null
    ) || "Untitled";

  // If the date is not present in the MDX header, add it.
  if (!mdxHeaderObject.date) {
    mdxHeaderObject.date = formatDate(Date.now());
    needRewrite = true;
  }

  postSummary.date = mdxHeaderObject.date;

  // If the image is not present in the MDX header, add default image.
  if (!mdxHeaderObject.image) {
    mdxHeaderObject.image = "/images/blog_no_image_placeholder.webp";
    needRewrite = true;
  }

  postSummary.image = mdxHeaderObject.image;

  postSummary.slug = file.match(postNamePattern)[1];

  postSummary.estimatedReadTime = estimateReadTime(mdxFile);

  postSummary.description =
    mdxHeaderObject.meta.reduce(
      (description, meta) =>
        description || (meta["name"] === "description" && meta["content"]),
      null
    ) || "";

  postSummary.tags = mdxHeaderObject.tags || [];

  // If the twitter card is not presend in the MDX header, add twiter card meta
  // and OG meta.
  if (
    !mdxHeaderObject.meta.reduce(
      (hasTwitterCard, meta) =>
        hasTwitterCard || meta["name"] === "twitter:card",
      false
    )
  ) {
    mdxHeaderObject.meta.push({
      name: "twitter:card",
      content: "summary_large_image",
    });
    mdxHeaderObject.meta.push({
      name: "twitter:title",
      content: postSummary.title,
    });
    mdxHeaderObject.meta.push({
      name: "twitter:description",
      content: postSummary.description,
    });
    mdxHeaderObject.meta.push({
      property: "og:title",
      content: postSummary.title,
    });
    mdxHeaderObject.meta.push({
      property: "og:description",
      content: postSummary.description,
    });

    if (postSummary.image !== "/images/blog_no_image_placeholder.webp") {
      mdxHeaderObject.meta.push({
        name: "twitter:image",
        content: mdxHeaderObject.image,
      });
      mdxHeaderObject.meta.push({
        property: "og:image",
        content: mdxHeaderObject.image,
      });
    }

    needRewrite = true;
  }

  // rewrite the MDX file if needed
  if (needRewrite) {
    const newMdxHeader = stringify(mdxHeaderObject);
    const newMdxFile = mdxFile.replace(mdxHeaderStr, newMdxHeader);
    fs.writeFileSync(`${routesDirectory}/${file}`, newMdxFile);
  }

  return postSummary;
});

/**
 * Sorts the posts array by date and title.
 */
posts.sort((a, b) => {
  if (a.date === b.date) {
    return a.title > b.title ? 1 : -1;
  }

  return a.date > b.date ? -1 : 1;
});

/**
 * Writes the posts array to a JSON file.
 */
fs.writeFileSync(
  "./tools/posts-summaries.json",
  JSON.stringify(posts, null, 2)
);
