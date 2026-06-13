import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";
import fs from 'fs';
import path from 'path';

export default async function (eleventyConfig) {

    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.setTemplateFormats([
        "html",
        "md",
        "jpg",
        "png",
        "svg",
        "ico",
        "mp4"
    ]);

    // Fast, native text-based minification that will NEVER crash on syntax typos
    eleventyConfig.on('eleventy.before', async () => {
        const srcDir = path.join(process.cwd(), 'src');
        if (!fs.existsSync(srcDir)) return;

        const folders = fs.readdirSync(srcDir);

        folders.forEach(folder => {
            const dirPath = path.join(srcDir, folder);

            if (fs.statSync(dirPath).isDirectory()) {
                const files = fs.readdirSync(dirPath);

                files.filter(file => file.endsWith('.css')).forEach(fileName => {
                    const filePath = path.join(dirPath, fileName);
                    const rawCss = fs.readFileSync(filePath, 'utf8');

                    const outputDir = path.join(process.cwd(), '_site', folder);
                    fs.mkdirSync(outputDir, { recursive: true });

                    // Condition: Keep a raw, unminified version ONLY for constellation.css
                    if (fileName === 'constellation.css') {
                        fs.writeFileSync(path.join(outputDir, 'constellation.css'), rawCss);
                    }

                    // Safe Regex Minification: Strips comments, line breaks, and extra spaces
                    const minifiedCss = rawCss
                        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                        .replace(/\s*([{}|:;,])\s*/g, '$1') // Remove spaces around structural tokens
                        .replace(/\s+/g, ' ') // Collapse multiple spaces into one
                        .trim(); // Trim trailing space

                    // Rename constellation to .min.css, others overwrite standard name
                    const outputName = (fileName === 'constellation.css')
                        ? 'constellation.min.css'
                        : fileName;

                    fs.writeFileSync(path.join(outputDir, outputName), minifiedCss);
                });
            }
        });
    });

    eleventyConfig.addWatchTarget("src/*/*.css");

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
