import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// MAIR-493: the reusable workflow checks out the CICD composite actions at `cicd_version`.
// Renovate bumped `uses:` to v4.2.2 alone, so main ran v4.2.2 jobs against the v4.2.1 action
// layout and every job failed with "Can't find 'action.yml'". Both refs must stay identical.
const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/cicd.yaml'), 'utf8');

it('MAIR-493: checks out the CICD actions at the same ref as the reusable workflow', () => {
  const uses = workflow.match(/uses: mairie360\/CICD\/\.github\/workflows\/front-libs-cicd\.yml@(\S+)/)?.[1];
  const cicdVersion = workflow.match(/^ {6}cicd_version: (\S+)$/m)?.[1];

  expect(uses).toBeDefined();
  expect(cicdVersion).toBe(uses);
});
