import { visit } from "unist-util-visit";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverBuildPath: "functions/[[path]].js",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  tailwind: true,
  postcss: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  mdx: async (filename) => {
    const [rehypeHighlight, remarkToc, remarkMath, rehypeKatex] =
      await Promise.all([
        import("rehype-highlight").then((mod) => mod.default),
        import("remark-toc").then((mod) => mod.default),
        import("remark-math").then((mod) => mod.default),
        import("rehype-katex").then((mod) => mod.default),
      ]);

    return {
      remarkPlugins: [remarkToc, remarkMath],
      rehypePlugins: [enhancedRehypHighlight(rehypeHighlight), rehypeKatex],
    };
  },
};

/**
 * @typedef {import('rehype-highlight').default} Plugin
 */

/**
 *
 * @param {Plugin} highlightPlugin
 * @returns {Plugin}
 */
function enhancedRehypHighlight(highlightPlugin) {
  return (options) => {
    const rh = highlightPlugin(options);
    return (tree, file) => {
      // preprocess, extract code and language
      visit(tree, (node) => {
        if (node?.type === "element" && node?.tagName === "pre") {
          const [codeElement] = node.children;

          if (codeElement.tagName !== "code") {
            return;
          }

          // add code to node properties of react pre component
          node.properties.code = codeElement.children[0].value;

          if (!codeElement.properties.className) {
            return;
          }

          // add language to node properties of react pre component
          node.properties.language = codeElement.properties.className[0].slice(
            "language-".length
          );
        }
      });
      // normal process
      rh(tree, file);
      // postprocess, replace pre with Pre and add import statement
      visit(tree, (node) => {
        if (node?.type === "element" && node?.tagName === "pre") {
          node.tagName = "Pre";
        }
      });
      tree.children.push(preComponentImport);
    };
  };
}

/**
 * mdx Pre component import statement
 */
const preComponentImport = {
  type: "mdxjsEsm",
  data: {
    estree: {
      type: "Program",
      body: [
        {
          type: "ImportDeclaration",
          specifiers: [
            {
              type: "ImportDefaultSpecifier",
              local: {
                type: "Identifier",
                name: "Pre",
              },
            },
          ],
          source: {
            type: "Literal",
            value: "~/components/pre",
            raw: '"~/components/pre"',
          },
        },
      ],
      sourceType: "module",
    },
  },
};
