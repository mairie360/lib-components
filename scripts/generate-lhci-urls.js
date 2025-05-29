const glob = require("glob");
const path = require("path");
const fs = require("fs");

const storyFiles = glob.sync("src/**/*.stories.@(js|jsx|ts|tsx)");

const urls = storyFiles.map((filePath) => {
  const fileName = path.basename(filePath).replace(/\.(stories)\..+$/, "").toLowerCase();

  // Formate l'ID story comme "foldername-filename"
  const storyId = `${fileName}`;

  // Retourne uniquement la partie relative de l'URL
  return `/?path=/docs/example-${storyId}--docs`;
});

fs.writeFileSync("lhci-urls.json", JSON.stringify(urls, null, 2));
console.log(`✅ ${urls.length} URLs générées pour Lighthouse`);
