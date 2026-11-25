# GitHub and production verification

Every `main` push runs Application verification with Node 24.22.1 and the
repository's pinned pnpm 9.15.0. The workflow can also be dispatched manually
against `main`, so a failed application check can be repeated without a source
change or preview branch. Frozen installation, dependency security regressions,
workspace types, application lint/build and registry audit must all pass. It
uses no production credentials and does not migrate or seed a database.

CodeQL remains configured through GitHub's default setup. Application
verification does not replace or disable that scan. A successful application
job is not evidence that the CodeQL result was uploaded successfully. Inspect
the latest analysis on the exact commit under Security → Code scanning.
GitHub's default-setup runs may reject the ordinary Actions rerun command;
do not toggle scanning off or dismiss a failed analysis to clear that failure.

For a release, verify GitHub's checks and Vercel's production deployment against
the same `main` SHA. A green deployment for a different commit does not qualify.
Preserve the previous Ready production deployment for rollback. Never infer
production acceptance from a preview or from a queued job.

The official SheetJS 0.20.3 tarball resolution now includes its SHA-512 integrity
in the lockfile. Frozen installs verify the downloaded archive rather than
accepting an external tarball without a pinned digest. The URL and package
version are unchanged; no dependency security override was relaxed.
