import { HtmlBasePlugin } from "@11ty/eleventy";
import { transform, browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

export default function (eleventyConfig) {

    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.setTemplateFormats([
        "html",
        "jpg",
        "png",
        "svg",
        "ico",
        "mp4",
        "css"
    ]);

    eleventyConfig.addExtension("css", {
        outputFileExtension: "css",

        compile: async function (inputContent, inputPath) {
            let targets = browserslistToTargets(browserslist("defaults, last 2 versions, not dead"));

            return async () => {
                let { code } = transform({
                    filename: inputPath,
                    code: Buffer.from(inputContent),
                    minify: true,
                    targets
                });

                return code.toString();
            };
        }
    });

    eleventyConfig.addWatchTarget("src/*/*.css");

    eleventyConfig.addPassthroughCopy("src/*/*.js");

    eleventyConfig.addCollection("orderedDocs", function (collectionApi) {
        const docs = collectionApi.getFilteredByTag("docs");
        const topicsMap = {};

        docs.forEach(item => {
            const pathParts = item.page.filePathStem.split('/');
            const folderName = pathParts.length >= 4 ? pathParts : "General";

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

        return Object.values(topicsMap)
            .sort((a, b) => a.order - b.order)
            .map(topic => {
                topic.pages.sort((a, b) => a.order - b.order);
                return topic;
            });
    });

    return {
        pathPrefix: "/constellation/"
    };
};
