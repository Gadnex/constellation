import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";

export default async function (eleventyConfig) {

    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.setTemplateFormats([
        "html",
        "md",
        "jpg",
        "png",
        "svg",
        "ico"
    ]);

    eleventyConfig.addPassthroughCopy("src/*/*.css");
    eleventyConfig.addPassthroughCopy("src/*/*.js");

    eleventyConfig.addCollection("topics", function(collectionApi) {
        const docs = collectionApi.getFilteredByTag("docs");
        const topics = new Set();
        
        docs.forEach(item => {
            const pathParts = item.page.filePathStem.split('/');
            
            if (pathParts.length >= 4) {
                topics.add(pathParts[2]); 
            }
        });
        
        return Array.from(topics);
    });

    const options = {
        html: true,
        breaks: true,
        linkify: true,
    };

    let markdownLib = MarkdownIt(options)
        .use(
            await Shiki({
                themes: {
                    light: 'github-dark',
                    dark: 'github-dark',
                }
            }),
        );

    eleventyConfig.setLibrary("md", markdownLib);

    return {
        pathPrefix: "/constellation/"
    };
};
