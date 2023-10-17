import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
// import terser from "lume/plugins/terser.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import gpm from "https://deno.land/x/gpm@v0.2.0/mod.ts";
// import pageFind from "https://deno.land/x/lume@v1.18.4/plugins/pagefind.ts";
// import sitemap from "https://deno.land/x/lume@v1.18.4/plugins/sitemap.ts"
// import feed from "https://deno.land/x/lume@v1.18.4/plugins/feed.ts";

import windi from "https://deno.land/x/lume@v1.14.2/plugins/windi_css.ts";




const site = lume({
  location: new URL("https://example.com/"),
});

site.data("currentYear", new Date().getFullYear());

site.use(windi({
  cssFile: "tailwind.css"
}));


site
  .ignore("README.md")
  .copy("img")
  .use(postcss())
  // .use(terser())
  .use(date())
  .use(codeHighlight())
  .use(basePath())
  .use(slugifyUrls({ alphanumeric: false }))
  .use(resolveUrls())
  //   .use(pageFind({
  //   ui: {
  //     resetStyles: false,
  //   },
  // }))
  //   .use(feed({
  //   output: ["/feed.json", "/feed.xml"],
  //   query: "type=posts",
  //   info: {
  //     title: "=site.title",
  //     description: "=site.description",
  //   },
  //   items: {
  //     title: "=title",
  //     content: "$.post-body",
  //   }
  // }))
  .addEventListener(
    "beforeBuild",
    () => gpm(["oom-components/searcher"], "js/vendor"),
  );

export default site;
