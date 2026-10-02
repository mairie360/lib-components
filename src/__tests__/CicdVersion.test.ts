import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

it('loads composite security and release actions from the same published tag as the reusable workflow', () => {
  const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/cicd.yaml'), 'utf8');
  const reusable = workflow.match(/uses:\s*mairie360\/CICD\/\.github\/workflows\/front-libs-cicd\.yml@(v\d+\.\d+\.\d+)/);
  const actions = workflow.match(/cicd_version:\s*(v\d+\.\d+\.\d+)/);
  expect(reusable).not.toBeNull();
  expect(actions).not.toBeNull();
  expect(actions?.[1]).toBe(reusable?.[1]);
});
