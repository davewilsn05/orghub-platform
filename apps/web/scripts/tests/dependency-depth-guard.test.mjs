import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

// Exercise the dependency actually loaded by Next's lint rules.
const require = createRequire(import.meta.url);
const configRequire = createRequire(require.resolve("eslint-config-next"));
const nextRequire = createRequire(configRequire.resolve("@next/eslint-plugin-next"));
const glob = nextRequire("fast-glob");
const globRequire = createRequire(nextRequire.resolve("fast-glob"));
const micromatch = globRequire("micromatch");
const braces = createRequire(globRequire.resolve("micromatch"))("braces");

test("ordinary brace expansion and glob matching remain compatible", () => {
  assert.deepEqual(braces.expand("file-{1..3}.{js,ts}"), [
    "file-1.js", "file-1.ts", "file-2.js", "file-2.ts", "file-3.js", "file-3.ts",
  ]);
  assert.deepEqual(
    micromatch(["app/page.tsx", "app/layout.tsx", "app/style.css"], "app/{page,layout}.{ts,tsx}"),
    ["app/page.tsx", "app/layout.tsx"],
  );
});

test("Next's glob dependency still discovers page files", () => {
  const cwd = mkdtempSync(join(tmpdir(), "lint-glob-"));
  try {
    mkdirSync(join(cwd, "pages", "nested"), { recursive: true });
    writeFileSync(join(cwd, "pages", "index.tsx"), "");
    writeFileSync(join(cwd, "pages", "nested", "about.js"), "");
    writeFileSync(join(cwd, "pages", "style.css"), "");
    assert.deepEqual(glob.sync("pages/**/*.{js,tsx}", { cwd }).sort(), [
      "pages/index.tsx", "pages/nested/about.js",
    ]);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("deep brace and parenthesis strings fail with a controlled depth error", () => {
  for (const [open, close] of [["{", "}"], ["(", ")"], ["{(", ")}"]]) {
    const pattern = open.repeat(2000) + "a,b" + close.repeat(2000);
    for (const method of ["parse", "compile", "expand"]) {
      assert.throws(() => braces[method](pattern), /exceeds max depth/);
    }
  }
});

test("callers cannot raise or disable the maximum nesting limit", () => {
  const pattern = "{".repeat(101) + "a,b" + "}".repeat(101);
  for (const maxDepth of [undefined, 1000, Infinity, NaN]) {
    assert.throws(() => braces.parse(pattern, { maxDepth }), /exceeds max depth/);
  }
});

test("direct AST processing also enforces the depth limit", () => {
  for (const method of ["compile", "expand", "stringify"]) {
    let node = { type: "text", value: "x" };
    for (let depth = 0; depth < 101; depth++) {
      node = { type: "paren", nodes: [node] };
    }
    assert.throws(
      () => braces[method]({ type: "root", nodes: [node] }),
      /AST depth .* exceeds max depth/,
    );
  }
});

