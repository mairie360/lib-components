import fs from 'node:fs';
import path from 'node:path';

// MAIR-608 component tree convention: a component is a folder `Name/` holding `index.ts`,
// `Name.tsx`, `Name.test.tsx` and a `components/` folder with one such folder per direct
// sub-component. A component reaches its sub-components only through their `index.ts`.
const root = path.resolve(__dirname, '../..');
const componentsRoot = path.join(root, 'src/components');
const rel = (file: string) => path.relative(root, file).split(path.sep).join('/');
const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const isTest = (file: string) => /\.test\.tsx?$/.test(file);
const componentFolders = () => walk(componentsRoot).filter(file => file.endsWith('.tsx') && !isTest(file) && path.basename(file, '.tsx') === path.basename(path.dirname(file))).map(file => path.dirname(file));

describe('component tree convention (MAIR-608)', () => {
  it('every component is a folder with its index, its file and its co-located test', () => {
    const folders = componentFolders();
    expect(folders.length).toBeGreaterThan(0);
    const problems: string[] = [];
    for (const folder of folders) {
      const name = path.basename(folder);
      const index = path.join(folder, 'index.ts');
      if (!fs.existsSync(index)) problems.push(`${rel(folder)} has no index.ts`);
      else if (!new RegExp(`from '\\./${name}'`).test(fs.readFileSync(index, 'utf8'))) problems.push(`${rel(index)} does not export ${name}`);
      if (!fs.existsSync(path.join(folder, `${name}.test.tsx`))) problems.push(`${rel(folder)} has no co-located ${name}.test.tsx`);
      const sub = path.join(folder, 'components');
      if (fs.existsSync(sub)) for (const entry of fs.readdirSync(sub, { withFileTypes: true })) {
        if (!entry.isDirectory() || !fs.existsSync(path.join(sub, entry.name, `${entry.name}.tsx`))) problems.push(`${rel(sub)}/${entry.name} is not a component folder`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('every .tsx under src/components is a component file or its test, never a loose file', () => {
    const loose = walk(componentsRoot).filter(file => file.endsWith('.tsx') && !isTest(file) && path.basename(file, '.tsx') !== path.basename(path.dirname(file)));
    expect(loose.map(rel)).toEqual([]);
  });

  it('a component imports its sub-components through their index.ts only', () => {
    const problems: string[] = [];
    for (const file of walk(componentsRoot).filter(file => /\.tsx?$/.test(file) && !isTest(file))) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const spec = match[1];
        if (!spec.startsWith('.') && !spec.startsWith('@/components/')) continue;
        if (/\/index$/.test(spec)) problems.push(`${rel(file)} must import the folder, not ${spec}`);
        // A file inside another component's folder (its helpers included) is reached through that folder only.
        const base = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : path.resolve(path.dirname(file), spec);
        const target = ['.tsx', '.ts'].map(ext => base + ext).find(candidate => fs.existsSync(candidate));
        if (!target) continue;
        const owner = path.dirname(target);
        const ownerIsComponent = fs.existsSync(path.join(owner, `${path.basename(owner)}.tsx`));
        if (ownerIsComponent && !file.startsWith(owner + path.sep)) problems.push(`${rel(file)} must import ${rel(owner)} through its index.ts, not ${spec}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
