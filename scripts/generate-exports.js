import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.resolve(__dirname, '../src/components');
const outputFile = path.resolve(__dirname, '../src/index.tsx');

const files = fs
  .readdirSync(componentsDir)
  .filter((file) => file.match(/\.tsx?$/))
  .filter((file) => file !== 'index.ts' && file !== 'index.tsx')
  .filter((file) => !file.toLowerCase().includes('stories'));

const exports = files.map((file) => {
  const baseName = path.basename(file, path.extname(file));
  const name = baseName.split('.')[0];
  return `export { ${name} } from './components/${baseName}';`;
});

fs.writeFileSync(outputFile, exports.join('\n') + '\n', 'utf8');

console.log(`✅ Fichier index.tsx généré avec ${files.length} composants (sans fichiers "stories").`);
