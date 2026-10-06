# Dependency security remediation — 2026-10-05

Next.js and its lint configuration are pinned to 15.5.27 in every app,
including fixes for the image optimization and Windows server security advisories.
The npm audit thresholds remain unchanged.

## Temporary braces backport

The Next lint plugin loads fast-glob, which loads micromatch and braces.
The upstream braces 3.0.3 release has no published fix for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
Downgrading Next's lint configuration would remove current lint coverage.

The exact npm override `braces: npm:@dieub/braces-depth-guard@3.0.3-pn.3`
uses a third-party MIT-licensed backport. It is not an official upstream release.
The published runtime was diffed against braces 3.0.3 before adoption:
changes add a maximum nesting depth of 100 to parsing and recursive AST
processing, validate limit options, and reject cyclic parent chains during
expansion. Existing runtime entry points and the fill-range dependency remain.

The backport derives from [upstream PR 72](https://github.com/micromatch/braces/pull/72),
including commit `d0d575e55e74a4e0218e5248fafb79efc3e54ebb`.
The reviewed artifact's integrity is:

```text
sha512-QY+Uq4s42STyIMPoRkBuUZfYyvz0uZuwuUburLwMx5N+lWqnHHaBxcKPtgKVKjTyFnS1q4ivKu9Wxi4VG7FE9Q==
```

The lockfile pins those bytes. The package has registry signatures and an
npm provenance attestation. Its README still calls pn.3 unpublished; the
registry tarball, integrity, and attestation identify the actual reviewed release.

The dependency-depth-guard regression tests resolve braces through the actual
Next lint dependency chain. They verify ordinary expansion, filesystem glob
discovery, rejection of deeply nested strings and ASTs, and enforcement when a
caller tries to raise or disable the limit. The security checks failed against
upstream 3.0.3 and passed against this backport.

This mitigates the reported nesting issue; it does not establish universal
resource-exhaustion protection for arbitrary expansion cardinality or AST width.
Replace the override with an official compatible patched release when available,
keeping the behavioral tests. Do not remove the override merely because the
renamed package does not appear in npm's advisory database.


## Source maps and document parsing

The source-map-js 1.2.2 override fixes GHSA-68fv-2mgg-jv7q. Mammoth now uses
argparse 2.0.1 to remove the unpatched sprintf-js dependency (GHSA-hp3w-g68c-fv3c).
Its XML parser stays on the patched, compatible xmldom 0.8.15 release; the prior
open-ended override incorrectly selected the incompatible 0.9 API. Real DOCX
extraction and CLI help, format and output tests verify the supported behavior.
