# Local development-tool security backports

These source-tracked packages correct two unreleased upstream security defects.
They are local development overrides, explicitly named as local forks, and are
not claimed to be upstream patched releases. The original source hashes, registry
integrity and upstream references are recorded in `provenance.json`.

- `braces`: based on npm `braces@3.0.3`, with its MIT license and original
  authorship preserved. Fixes GHSA-vfj7-8cjw-p6xm by bounding parser brace and
  parenthesis nesting to 128 containers. An iterative, active-path AST preflight
  rejects child cycles, excessive container depth and more than 65,536 visits.
  It accepts shared acyclic nodes and the terminal leaves of 128-level patterns.
  Expansion derives queue ownership from the actual child traversal and never
  follows caller-supplied `parent` metadata, preventing cycles and foreign queues
  from redirecting expansion. Deep/cyclic inputs throw `SyntaxError` with code
  `ERR_BRACES_COMPLEXITY`; callers must handle invalid input as with existing
  length/range validation. This does not bound every Cartesian expansion or
  generated regular expression, or qualify arbitrary getters/proxies/array-valued
  text nodes. Public string/AST operations and ordinary glob behavior remain.
- `sprintf-js`: based on npm `sprintf-js@1.0.3`, retaining its BSD-3-Clause
  license. Fixes GHSA-hp3w-g68c-fv3c by clamping numeric `e`/`f`/`g` precision
  at 100 and treating zero `g` precision as one significant digit. Validation
  lives in the formatter so its public `parse`/`format`/`cache` API is retained.
  Zero `e`/`f`, string precision and ordinary formatting stay compatible.
  Only the CommonJS source entry is included; no stale browser bundle is shipped.
  The numeric bound targets this repository's Node 24 toolchain.

The implementation references the public upstream proposals
[braces PR 88](https://github.com/micromatch/braces/pull/88) and
[sprintf PR 239](https://github.com/alexei/sprintf.js/pull/239), both unmerged
when reviewed on 2026-10-16. It is a minimal local backport rather than a blind
copy: PR 88's parent traversal, visit-budget and terminal-depth gaps are covered.

`node scripts/check-tooling-patches.cjs` resolves the packages through the actual
`micromatch` and `argparse` registry consumers and runs malicious inputs in bounded
subprocesses, including asynchronous precision calls without exception handlers.
It runs in the real `prebuild` before the existing checks. `--stock` records the
negative control before overrides are installed; `--vendor` tests local sources
before the clean install. The normal check never accepts these shortcuts itself.

Root `file:` development dependencies, `$` override references and lockfile links
make a fresh `npm ci` reproducible
without a new registry package or credentials. Keep `vendor/` available before
installing. Root overrides do not propagate to consumers of the published UI
library; consumers with the same development-tool findings need their own tracked
overrides. The library's published `files: ["dist"]` excludes these development
sources. Replace the forks with verified official patched releases when available,
then remove the overrides only after the same regression checks pass.

A renamed package can disappear from name/version-based advisory matching even
with vulnerable code. Therefore an audit result is insufficient evidence: retain
the source diff, provenance, negative control, transitive-resolution assertions
and runtime regression checks. No audit threshold or CI security gate is changed.
