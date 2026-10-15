import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// MAIR-436: the CI token is read-only by default, only the job calling the release pipeline
// gets write scopes, and push runs on main only (pull_request already covers PR branches).
const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/cicd.yaml'), 'utf8');
const [header, jobs] = workflow.split(/^jobs:\n/m);

it('MAIR-436: runs on push for main only, plus every pull request', () => {
  expect(header).toMatch(/^on:\n(?: {2}#.*\n)*  push:\n    branches: \[main\]\n  pull_request:\n  workflow_dispatch:\n/m);
});

it('MAIR-436: defaults to a read-only workflow token', () => {
  expect(header).toMatch(/^permissions:\n  contents: read\n(?!  )/m);
  expect(header).not.toMatch(/: write$/m);
});

it('MAIR-436: grants write scopes to the release job only', () => {
  expect(jobs).toMatch(/^  CICD:\n(?: {4}#.*\n)* {4}permissions:\n {6}contents: write\n {6}packages: write\n {6}pages: write\n {6}id-token: write\n {4}uses: mairie360\/CICD\/\.github\/workflows\/front-libs-cicd\.yml@/m);
  expect(jobs.match(/^ {2}[\w-]+:$/gm)).toEqual(['  CICD:']);
});
