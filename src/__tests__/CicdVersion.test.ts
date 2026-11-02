import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readWorkflow = (name: string): string =>
  readFileSync(resolve(process.cwd(), '.github/workflows', name), 'utf8');

const atLeast = (version: string, min: number[]): boolean => {
  const parts = version.slice(1).split('.').map(Number);
  for (let i = 0; i < min.length; i += 1) {
    if (parts[i] !== min[i]) return parts[i] > min[i];
  }
  return true;
};

it('loads composite security and release actions from the same published tag as the reusable workflow', () => {
  const workflow = readWorkflow('cicd.yaml');
  const reusable = workflow.match(/uses:\s*mairie360\/CICD\/\.github\/workflows\/front-libs-cicd\.yml@(v\d+\.\d+\.\d+)/);
  const actions = workflow.match(/cicd_version:\s*(v\d+\.\d+\.\d+)/);
  expect(reusable).not.toBeNull();
  expect(actions).not.toBeNull();
  expect(actions?.[1]).toBe(reusable?.[1]);
});

// MAIR-771: the GDPR pull request checklist runs on the same CICD release as the rest of the
// pipeline, and that release carries the GDPR controls (v4.12.0 or later).
it('MAIR-771: the GDPR checklist calls the same CICD release as the pipeline, v4.12.0 or later', () => {
  const pipeline = readWorkflow('cicd.yaml').match(/front-libs-cicd\.yml@(v\d+\.\d+\.\d+)/)?.[1];
  const gdpr = readWorkflow('gdpr-pr.yml');
  const reusable = gdpr.match(/gdpr-pr-cicd\.yml@(v\d+\.\d+\.\d+)/)?.[1];
  const input = gdpr.match(/cicd_version:\s*(v\d+\.\d+\.\d+)/)?.[1];
  expect(pipeline).toBeDefined();
  expect([reusable, input]).toEqual([pipeline, pipeline]);
  expect(atLeast(pipeline as string, [4, 12, 0])).toBe(true);
});
