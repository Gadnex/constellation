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

    eleventyConfig.addCollection("orderedDocs", function (collectionApi) {
        const docs = collectionApi.getFilteredByTag("docs");
        const topicsMap = {};

        docs.forEach(item => {
            // Fallbacks if data is missing
            const pathParts = item.page.filePathStem.split('/');
            const folderName = pathParts.length >= 4 ? pathParts[2] : "General";

            // Eleventy automatically reads these from your JSON and Frontmatter
            const topicName = item.data.topic || folderName;
            const topicOrder = item.data.topicOrder || 99;
            const pageOrder = item.data.pageOrder || 99;

            if (!topicsMap[topicName]) {
                topicsMap[topicName] = {
                    name: topicName,
                    order: topicOrder,
                    pages: []
                };
            }

            topicsMap[topicName].pages.push({
                title: item.data.title || item.page.fileSlug,
                url: item.url,
                order: pageOrder
            });
        });

        // Sort topics, then sort pages within those topics
        return Object.values(topicsMap)
            .sort((a, b) => a.order - b.order)
            .map(topic => {
                topic.pages.sort((a, b) => a.order - b.order);
                return topic;
            });
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
