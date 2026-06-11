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
 * Token counting + YON-specific truncation utilities.
 *
 * Token counting is delegated to @younndai/ai-relay (js-tiktoken, precise mode).
 * Truncation logic is benchmark-specific and stays here.
 */

import { countTokens as relayCountTokens } from '@younndai/ai-relay';

/** Count tokens using precise BPE tokenization. */
export function countTokens(text: string): number {
  return relayCountTokens(text, true); // precise = true
}

/**
 * Truncate YON content to fit within a token budget.
 * Removes sections from the end first. Preserves line-independence.
 * Excludes @DOC header from budget accounting (it's metadata).
 *
 * @returns The truncated content and the 1-based section indices that survived.
 */
export function truncateYonToTokenBudget(
  yon: string,
  budget: number,
): { text: string; survivingSections: number[] } {
  const lines = yon.split('\n');
  const docLine = lines.find((l) => l.trim().startsWith('@DOC')) ?? '';

  // Parse into sections
  const sections: { index: number; lines: string[] }[] = [];
  let currentLines: string[] = [];
  let sectionIdx = 0;

  for (const line of lines) {
    if (line.trim().startsWith('@DOC')) continue;
    if (line.trim().startsWith('@SEC')) {
      if (currentLines.length > 0 && sectionIdx > 0) {
        sections.push({ index: sectionIdx, lines: currentLines });
      }
      sectionIdx++;
      currentLines = [line];
      continue;
    }
    currentLines.push(line);
  }
  if (currentLines.length > 0 && sectionIdx > 0) {
    sections.push({ index: sectionIdx, lines: currentLines });
  }

  // Greedily add sections until budget is exceeded
  const surviving: number[] = [];
  const selectedLines: string[] = [docLine, ''];

  for (const sec of sections) {
    const candidateText = [...selectedLines, ...sec.lines, ''].join('\n');
    const contentOnly = candidateText
      .split('\n')
      .filter((l) => !l.trim().startsWith('@DOC'))
      .join('\n');
    if (countTokens(contentOnly) <= budget) {
      selectedLines.push(...sec.lines, '');
      surviving.push(sec.index);
    } else {
      break;
    }
  }

  return { text: selectedLines.join('\n'), survivingSections: surviving };
}

/**
 * Truncate NL prose to fit within a token budget.
 * Paragraphs are separated by double newlines.
 *
 * @returns The truncated content and the 1-based paragraph indices that survived.
 */
export function truncateNlToTokenBudget(
  nl: string,
  budget: number,
): { text: string; survivingParagraphs: number[] } {
  const paragraphs = nl
    .split(/\r?\n\r?\n/)
    .filter((p) => p.trim().length > 0);

  const surviving: number[] = [];
  const selected: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const candidate = [...selected, paragraphs[i]!].join('\n\n');
    if (countTokens(candidate) <= budget) {
      selected.push(paragraphs[i]!);
      surviving.push(i + 1); // 1-based
    } else {
      break;
    }
  }

  return { text: selected.join('\n\n'), survivingParagraphs: surviving };
}
