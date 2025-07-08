import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.resolve(__dirname, "../.lighthouseci");

const reportFiles = fs
  .readdirSync(reportsDir)
  .filter((f) => f.endsWith(".report.json"));

let allPassed = true;

reportFiles.forEach((file) => {
  const filePath = path.join(reportsDir, file);
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const requestedUrl = json.requestedUrl;
  const accessibilityScore = json.categories?.accessibility?.score || 0;

  const match = requestedUrl.match(/path=\/([^"]+)/);
  const cleanedPath = match ? match[1].replace(/\//g, "-") : "unknown";

  const newBaseName = `${cleanedPath}`;
  const jsonTarget = path.join(reportsDir, `${newBaseName}.report.json`);
  const htmlSource = file.replace(".report.json", ".report.html");
  const htmlTarget = path.join(reportsDir, `${newBaseName}.report.html`);

  fs.renameSync(filePath, jsonTarget);

  const htmlFullPath = path.join(reportsDir, htmlSource);
  if (fs.existsSync(htmlFullPath)) {
    fs.renameSync(htmlFullPath, htmlTarget);
  }

  if (accessibilityScore < 0.76) {
    console.error(`❌ Accessibility score < 0.76: ${newBaseName}`);
    allPassed = false;
  }
});

if (!allPassed) {
  console.error("🔴 Accessibility checks failed.");
  process.exit(1);
} else {
  console.log("✅ All accessibility scores are sufficient.");
}
