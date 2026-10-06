import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

const webRequire = createRequire(new URL('../apps/web/package.json', import.meta.url));
const mammothPath = webRequire.resolve('mammoth');
const mammothRequire = createRequire(mammothPath);
const mammoth = webRequire('mammoth');
const JSZip = mammothRequire('jszip');
const cli = join(dirname(mammothRequire.resolve('mammoth/package.json')), 'bin/mammoth');

async function documentBuffer() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Committee meeting notes</w:t></w:r></w:p></w:body></w:document>');
  return zip.generateAsync({ type: 'nodebuffer' });
}

test('document import extracts text from a real DOCX archive', async () => {
  const result = await mammoth.extractRawText({ buffer: await documentBuffer() });
  assert.equal(result.value.trim(), 'Committee meeting notes');
});

test('Mammoth CLI retains format and output arguments with argparse 2', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'commoncircle-docx-'));
  try {
    const input = join(directory, 'input.docx');
    const output = join(directory, 'output.html');
    await writeFile(input, await documentBuffer());
    const run = (args) => execFileSync(process.execPath, [cli, ...args], {
      encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.match(run(['--help']), /--output-format/);
    assert.equal(run([input, '--output-format', 'html']).trim(), '<p>Committee meeting notes</p>');
    run([input, output]);
    assert.equal((await readFile(output, 'utf8')).trim(), '<p>Committee meeting notes</p>');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
