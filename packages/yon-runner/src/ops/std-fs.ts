/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * YON Runner — std:fs.* Operations
 *
 * File system operations scoped to the sandbox root.
 * Implements YSL §2 (File System Operations).
 */

import { readFile, writeFile, readdir, stat, mkdir, rm, copyFile, rename } from "node:fs/promises";
import { join } from "node:path";
import type { OpHandler, ExecutionContext } from "../types.js";
import { Sandbox } from "../sandbox.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSandbox(ctx: ExecutionContext): Sandbox {
  return new Sandbox({ root: ctx.sandboxRoot, env: ctx.env });
}

function getSignal(ctx: ExecutionContext): AbortSignal {
  return ctx.signal;
}

function getPath(ctx: ExecutionContext, key: string = "path"): string {
  const sandbox = getSandbox(ctx);
  const path = String(ctx.args[key] ?? "");
  return sandbox.resolvePath(path);
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** std:fs.read@v1 — Read file content into a block. */
export const fsRead: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  return await readFile(path, { encoding: "utf-8", signal: getSignal(ctx) });
};

/** std:fs.write@v1 — Overwrite file content. */
export const fsWrite: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  const content = String(ctx.args["content"] ?? ctx.inputs.values().next().value ?? "");
  await writeFile(path, content, { encoding: "utf-8", signal: getSignal(ctx) });
  return true;
};

/** std:fs.append@v1 — Append content to file. */
export const fsAppend: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  const content = String(ctx.args["content"] ?? ctx.inputs.values().next().value ?? "");
  // appendFile doesn't support signal; use writeFile with 'a' flag instead
  await writeFile(path, content, { encoding: "utf-8", flag: "a", signal: getSignal(ctx) });
  return true;
};

/** std:fs.list@v1 — List files in a directory. */
export const fsList: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  const recursive = ctx.args["recursive"] === "true" || ctx.args["recursive"] === true;
  const entries = await readdir(path, { recursive, withFileTypes: true });
  return entries.map((e) => ({
    name: e.name,
    isDirectory: e.isDirectory(),
    path: e.parentPath ? join(e.parentPath, e.name) : e.name,
  }));
};

/** std:fs.exists@v1 — Check if path exists. */
export const fsExists: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

/** std:fs.stat@v1 — Get file metadata. */
export const fsStat: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  const s = await stat(path);
  return {
    size: s.size,
    mtime: s.mtime.toISOString(),
    type: s.isDirectory() ? "directory" : "file",
    mode: s.mode,
  };
};

/** std:fs.mkdir@v1 — Create a directory. */
export const fsMkdir: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  await mkdir(path, { recursive: true });
  return true;
};

/** std:fs.delete@v1 — Delete a file or directory. */
export const fsDelete: OpHandler = async (ctx) => {
  const path = getPath(ctx);
  await rm(path, { recursive: true, force: true });
  return true;
};

/** std:fs.copy@v1 — Copy file or directory. */
export const fsCopy: OpHandler = async (ctx) => {
  const sandbox = getSandbox(ctx);
  const src = sandbox.resolvePath(String(ctx.args["src"] ?? ""));
  const dest = sandbox.resolvePath(String(ctx.args["dest"] ?? ""));
  await copyFile(src, dest);
  return true;
};

/** std:fs.move@v1 — Move/rename file or directory. */
export const fsMove: OpHandler = async (ctx) => {
  const sandbox = getSandbox(ctx);
  const src = sandbox.resolvePath(String(ctx.args["src"] ?? ""));
  const dest = sandbox.resolvePath(String(ctx.args["dest"] ?? ""));
  await rename(src, dest);
  return true;
};

/** std:fs.diff@v1 — Diff two files (simplified). */
export const fsDiff: OpHandler = async (ctx) => {
  const sandbox = getSandbox(ctx);
  const pathA = sandbox.resolvePath(String(ctx.args["path_a"] ?? ""));
  const pathB = sandbox.resolvePath(String(ctx.args["path_b"] ?? ""));
  const contentA = await readFile(pathA, { encoding: "utf-8", signal: getSignal(ctx) });
  const contentB = await readFile(pathB, { encoding: "utf-8", signal: getSignal(ctx) });

  // Simple line-by-line diff
  const linesA = contentA.split("\n");
  const linesB = contentB.split("\n");
  const diff: string[] = [];
  const maxLen = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];
    if (a === b) {
      diff.push(` ${a ?? ""}`);
    } else {
      if (a !== undefined) diff.push(`-${a}`);
      if (b !== undefined) diff.push(`+${b}`);
    }
  }

  // Unified diff headers
  diff.unshift(`--- ${pathA}`);
  diff.splice(1, 0, `+++ ${pathB}`);
  diff.splice(2, 0, `@@ -1,${linesA.length} +1,${linesB.length} @@`);

  return diff.join("\n");
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/** Register all std:fs ops on a registry. */
export function registerFsOps(register: (op: string, handler: OpHandler) => void): void {
  register("std:fs.read@v1", fsRead);
  register("std:fs.write@v1", fsWrite);
  register("std:fs.append@v1", fsAppend);
  register("std:fs.list@v1", fsList);
  register("std:fs.exists@v1", fsExists);
  register("std:fs.stat@v1", fsStat);
  register("std:fs.mkdir@v1", fsMkdir);
  register("std:fs.delete@v1", fsDelete);
  register("std:fs.copy@v1", fsCopy);
  register("std:fs.move@v1", fsMove);
  register("std:fs.diff@v1", fsDiff);
}
