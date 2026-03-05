/**
 * Server-side document parser for extracting plain text from uploaded files.
 * Supports: .rtf, .txt, .pdf, .docx
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SUPPORTED_TYPES: Record<string, string> = {
  "text/plain": "txt",
  "text/rtf": "rtf",
  "application/rtf": "rtf",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

function getFileType(file: File): string | null {
  const fromMime = SUPPORTED_TYPES[file.type];
  if (fromMime) return fromMime;

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && ["txt", "rtf", "pdf", "docx"].includes(ext)) return ext;

  return null;
}

/**
 * Strip RTF control codes and return plain text.
 * Uses charAt() instead of bracket indexing for noUncheckedIndexedAccess compat.
 */
function parseRtf(buffer: Buffer): string {
  const raw = buffer.toString("binary");

  let text = "";
  let depth = 0;
  let skipGroup = false;
  let skipDepth = 0;
  let i = 0;

  const skipGroupNames = new Set([
    "fonttbl", "colortbl", "stylesheet", "info", "pict",
    "header", "footer", "headerl", "headerr", "footerl", "footerr",
    "expandedcolortbl",
  ]);

  while (i < raw.length) {
    const ch = raw.charAt(i);

    if (ch === "{") { depth++; i++; continue; }

    if (ch === "}") {
      if (skipGroup && depth === skipDepth) skipGroup = false;
      depth--;
      i++;
      continue;
    }

    if (skipGroup) { i++; continue; }

    if (ch === "\\") {
      i++;
      if (i >= raw.length) break;

      const next = raw.charAt(i);

      if (next === "\\") { text += "\\"; i++; continue; }
      if (next === "{") { text += "{"; i++; continue; }
      if (next === "}") { text += "}"; i++; continue; }
      if (next === "~") { text += "\u00A0"; i++; continue; }
      if (next === "-") { text += "\u00AD"; i++; continue; }
      if (next === "_") { text += "\u2011"; i++; continue; }

      if (next === "'") {
        i++;
        const hex = raw.substring(i, i + 2);
        i += 2;
        const code = parseInt(hex, 16);
        if (!isNaN(code)) text += String.fromCharCode(code);
        continue;
      }

      if (next === "u") {
        i++;
        let numStr = "";
        let c = raw.charAt(i);
        while (i < raw.length && (c === "-" || (c >= "0" && c <= "9"))) {
          numStr += c;
          i++;
          c = raw.charAt(i);
        }
        const code = parseInt(numStr, 10);
        if (!isNaN(code)) {
          text += String.fromCodePoint(code < 0 ? code + 65536 : code);
        }
        if (i < raw.length && raw.charAt(i) === "?") i++;
        if (i < raw.length && raw.charAt(i) === " ") i++;
        continue;
      }

      let word = "";
      let wc = raw.charAt(i);
      while (i < raw.length && wc >= "a" && wc <= "z") {
        word += wc;
        i++;
        wc = raw.charAt(i);
      }

      let pc = raw.charAt(i);
      if (i < raw.length && (pc === "-" || (pc >= "0" && pc <= "9"))) {
        while (i < raw.length && (pc === "-" || (pc >= "0" && pc <= "9"))) {
          i++;
          pc = raw.charAt(i);
        }
      }

      if (i < raw.length && raw.charAt(i) === " ") i++;

      if (skipGroupNames.has(word)) {
        skipGroup = true;
        skipDepth = depth;
        continue;
      }

      if (word === "par" || word === "line") text += "\n";
      else if (word === "tab") text += "\t";
      else if (word === "bullet") text += "\u2022";
      else if (word === "endash") text += "\u2013";
      else if (word === "emdash") text += "\u2014";
      else if (word === "lquote") text += "\u2018";
      else if (word === "rquote") text += "\u2019";
      else if (word === "ldblquote") text += "\u201C";
      else if (word === "rdblquote") text += "\u201D";

      continue;
    }

    if (ch === "\r" || ch === "\n") { i++; continue; }

    text += ch;
    i++;
  }

  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text.trim();
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export type ParseResult =
  | { ok: true; text: string; fileName: string; fileType: string }
  | { ok: false; error: string };

export async function parseDocument(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)` };
  }

  const fileType = getFileType(file);
  if (!fileType) {
    return { ok: false, error: `Unsupported file type: ${file.type || file.name.split(".").pop()}. Supported: .txt, .rtf, .pdf, .docx` };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text: string;

    switch (fileType) {
      case "txt":
        text = buffer.toString("utf-8").trim();
        break;
      case "rtf":
        text = parseRtf(buffer);
        break;
      case "pdf":
        text = await parsePdf(buffer);
        break;
      case "docx":
        text = await parseDocx(buffer);
        break;
      default:
        return { ok: false, error: `Unsupported file type: ${fileType}` };
    }

    if (!text) {
      return { ok: false, error: "Could not extract any text from the file." };
    }

    const MAX_CHARS = 50_000;
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + "\n\n[Document truncated — showing first ~50,000 characters]";
    }

    return { ok: true, text, fileName: file.name, fileType };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown parsing error";
    return { ok: false, error: `Failed to parse ${file.name}: ${msg}` };
  }
}
