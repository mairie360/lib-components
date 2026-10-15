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

exports.push("export { mairie360LogoSrc } from './assets/logo';");
exports.push("export { defaultSidebarItems } from './components/Sidebar';");
exports.push("export type { NotificationItem, NotificationSource } from './components/NotificationCenter';");
exports.push("export type { AppShellProps } from './components/AppShell';");
exports.push("export type { TaskStatusDefinition, TaskStatusSelectProps } from './components/TaskStatusSelect';");
exports.push("export type { TaskStatusKanbanTask, TaskStatusKanbanProps } from './components/TaskStatusKanban';");

exports.push("export type { SkeletonProps } from './components/Skeleton';");
exports.push("export type { EmptyStateProps } from './components/EmptyState';");
exports.push("export type { ToastProps, ToastVariant } from './components/Toast';");
exports.push("export { useToast } from './components/ToastProvider';");
exports.push("export type { ToastOptions, ToastContextValue, ToastProviderProps } from './components/ToastProvider';");

fs.writeFileSync(outputFile, exports.join('\n') + '\n', 'utf8');

console.log(`✅ Fichier index.tsx généré avec ${files.length} composants (sans fichiers "stories").`);
