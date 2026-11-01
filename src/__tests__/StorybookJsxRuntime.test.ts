import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// MAIR-316: the static Storybook compiled JSX with the classic runtime (tsconfig keeps
// `jsx: preserve`), so stories and components writing JSX without importing React rendered
// "React is not defined" instead of the component. It must use the same automatic transform as
// the published build (tsup.config.ts).
describe('Storybook JSX transform', () => {
  const read = (file: string) => readFileSync(join(__dirname, '..', '..', file), 'utf8');

  it('compiles JSX with the automatic runtime, like the published build', () => {
    expect(read('.storybook/main.ts')).toMatch(/esbuild:\s*\{[^}]*jsx:\s*'automatic'/);
    expect(read('tsup.config.ts')).toMatch(/options\.jsx = 'automatic'/);
  });
});
