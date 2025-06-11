const glob = require("glob");
const path = require("path");
const fs = require("fs");

const storyFiles = glob.sync("src/**/*.stories.@(js|jsx|ts|tsx)");

const urls = [];

storyFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");

  const titleMatch = content.match(/title:\s*['"`](.*?)['"`]/);

  if (!titleMatch) {
    console.warn(`❌ Aucun title trouvé dans ${filePath}`);
    return;
  }

  const title = titleMatch[1];

  const storyId = title
    .replace(/^components\//i, "")
    .replace(/\//g, "-")
    .toLowerCase();

  urls.push(`/?path=/docs/components-${storyId}--docs`);
});

fs.writeFileSync("lhci-urls.json", JSON.stringify(urls, null, 2));
console.log(`✅ ${urls.length} URLs générées pour Lighthouse`);
