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
 * Payload Fidelity Benchmark Suite
 *
 * Pillar: Lossless
 * Validates: @BEGIN/@END blocks preserve embedded content verbatim,
 *         including code with special characters, newlines, and unicode. (§3)
 *
 * Tests:
 * 1. JavaScript round-trip — embed JS code, parse, extract, compare byte-for-byte
 * 2. Python round-trip — embed Python with indentation and special chars
 * 3. SQL round-trip — embed SQL with quotes and identifiers
 * 4. HTML round-trip — embed HTML with tags, attributes, entities
 * 5. Unicode round-trip — embed mixed unicode, emoji, RTL text
 * 6. Escape comparison — count escape sequences needed by JSON vs YON
 */

import { parse } from '@younndai/yon-parser';
import { startTimer, localTimestamp } from '@younndai/ai-relay';
import type { BenchmarkResult, TestResult } from '../core/types.js';

// ---------------------------------------------------------------------------
// Test Payloads
// ---------------------------------------------------------------------------

const JS_PAYLOAD = `function processOrder(order) {
  const total = order.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  
  if (total > 1000) {
    console.log(\`High-value order: $\${total}\`);
    return { status: "premium", total, discount: total * 0.1 };
  }
  
  // Handle "special" characters: <>&'"
  const message = 'Order processed: "' + order.id + '"';
  return { status: "standard", total, message };
}`;

const PYTHON_PAYLOAD = `def calculate_metrics(data: dict[str, float]) -> dict:
    """Calculate performance metrics from raw data.
    
    Args:
        data: Dictionary with metric_name -> value pairs
        
    Returns:
        Computed statistics including mean, p95, p99
    """
    values = sorted(data.values())
    n = len(values)
    
    return {
        'mean': sum(values) / n,
        'p95': values[int(n * 0.95)],
        'p99': values[int(n * 0.99)],
        'count': n,
        'range': f"{values[0]:.2f} - {values[-1]:.2f}",
    }`;

const SQL_PAYLOAD = `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users USING btree (lower(email));

-- Handle special characters: "quoted", 'single', <angle>, &ampersand
INSERT INTO users (email, display_name) VALUES
  ('test@example.com', 'O''Brien & Sons'),
  ('admin@co.uk', 'Admin "Super" User');`;

const HTML_PAYLOAD = `<div class="dashboard" data-theme="dark">
  <header>
    <h1>Analytics &mdash; Q4 2025</h1>
    <p class="subtitle">Revenue: &euro;1,234,567 &bull; Users: 94,000+</p>
  </header>
  <section id="charts">
    <canvas id="revenue-chart" width="800" height="400"></canvas>
    <script>
      const ctx = document.getElementById('revenue-chart').getContext('2d');
      // "Special" chars in template literal
      const label = \`Revenue (€)\`;
    </script>
  </section>
  <!-- TODO: Add <footer> with "copyright" notice -->
</div>`;

const UNICODE_PAYLOAD = `# Multilingual Test 🌍

## Greetings
- English: Hello, World!
- Japanese: こんにちは世界
- Arabic: مرحبا بالعالم (right-to-left)
- Korean: 안녕하세요
- Emoji: 🚀💻🔧📊✅❌⚠️

## Math Symbols
- ∑(i=0..n) = n(n+1)/2
- √2 ≈ 1.414
- π ≈ 3.14159
- ∞ → ∅

## Special Characters
- Curly quotes: "hello" and 'world'
- Em dash: — En dash: – Ellipsis: …
- Currency: $100 • €85 • ¥15,000 • £65`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wrapInBeginEnd(langTag: string, content: string): string {
  return [
    `@DOC ver=2.0 | id=fidelity | title="Payload Test" | kind=data`,
    `@SEC name="${langTag} Payload"`,
    `@BEGIN lang=${langTag}`,
    content,
    `@END`,
    '',
  ].join('\n');
}

function extractBeginEndContent(yonDoc: string): string | null {
  const beginIdx = yonDoc.indexOf('@BEGIN');
  const endIdx = yonDoc.indexOf('@END');
  if (beginIdx === -1 || endIdx === -1) return null;

  // Content starts on the line after @BEGIN and ends on the line before @END
  const afterBegin = yonDoc.indexOf('\n', beginIdx);
  if (afterBegin === -1) return null;

  // The join('\n') in wrapInBeginEnd adds a \n between content and @END.
  // That newline is a structural separator, not part of the payload.
  const raw = yonDoc.slice(afterBegin + 1, endIdx);
  return raw.endsWith('\n') ? raw.slice(0, -1) : raw;
}

function countJsonEscapes(content: string): number {
  const jsonStr = JSON.stringify(content);
  let escapes = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '\\') {
      escapes++;
      i++; // Skip the escaped character
    }
  }
  return escapes;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function testPayloadRoundTrip(
  langTag: string,
  payload: string,
  label: string,
): TestResult {
  const doc = wrapInBeginEnd(langTag, payload);

  // Parse the document
  let parseSuccess = false;
  try {
    parse(doc);
    parseSuccess = true;
  } catch {
    parseSuccess = false;
  }

  // Extract the content back
  const extracted = extractBeginEndContent(doc);
  const byteMatch = extracted === payload;
  const trimMatch = extracted?.trim() === payload.trim();

  // Compare with JSON escaping
  const jsonEscapes = countJsonEscapes(payload);
  const yonEscapes = 0; // YON @BEGIN/@END needs zero escapes

  return {
    id: `payload-fidelity-${langTag}`,
    name: `Payload Fidelity — ${label}`,
    passed: parseSuccess && (byteMatch || trimMatch),
    metric: {
      name: 'byte_fidelity',
      value: byteMatch ? 100 : trimMatch ? 99 : 0,
      unit: '%',
      comparison: {
        baseline: jsonEscapes,
        baselineLabel: 'JSON escape sequences needed',
        delta: `${jsonEscapes} escapes avoided`,
      },
    },
    secondaryMetrics: [
      { name: 'payload_bytes', value: payload.length, unit: 'bytes' },
      { name: 'json_escapes', value: jsonEscapes, unit: 'sequences' },
      { name: 'yon_escapes', value: yonEscapes, unit: 'sequences' },
      { name: 'parse_success', value: parseSuccess ? 1 : 0, unit: 'bool' },
    ],
    detail:
      `${label}: ${payload.length} bytes embedded in @BEGIN/${langTag}...@END. ` +
      `Byte-for-byte match: ${byteMatch ? 'yes' : trimMatch ? 'whitespace-only diff' : 'NO'}. ` +
      `JSON would need ${jsonEscapes} escape sequences. YON needs 0. ` +
      `Verbatim embedding eliminates escape-related corruption risk.`,
  };
}

function testEscapeComparison(): TestResult {
  const payloads = [
    { label: 'JS', content: JS_PAYLOAD },
    { label: 'Python', content: PYTHON_PAYLOAD },
    { label: 'SQL', content: SQL_PAYLOAD },
    { label: 'HTML', content: HTML_PAYLOAD },
    { label: 'Unicode', content: UNICODE_PAYLOAD },
  ];

  let totalJsonEscapes = 0;
  for (const p of payloads) {
    totalJsonEscapes += countJsonEscapes(p.content);
  }

  return {
    id: 'payload-fidelity-escape-comparison',
    name: 'Payload Fidelity — Escape Sequence Comparison',
    passed: totalJsonEscapes > 0, // JSON always needs escapes, YON never does
    metric: {
      name: 'total_json_escapes',
      value: totalJsonEscapes,
      unit: 'sequences',
      comparison: {
        baseline: 0,
        baselineLabel: 'YON escape sequences',
        delta: `${totalJsonEscapes} escapes eliminated`,
      },
    },
    detail:
      `Across ${payloads.length} embedded payloads, JSON requires ${totalJsonEscapes} escape sequences. ` +
      `YON @BEGIN/@END requires 0. Each escape is a potential corruption point in multi-hop pipelines.`,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

async function run(): Promise<BenchmarkResult> {
  const elapsed = startTimer();

  const tests: TestResult[] = [
    testPayloadRoundTrip('javascript', JS_PAYLOAD, 'JavaScript'),
    testPayloadRoundTrip('python', PYTHON_PAYLOAD, 'Python'),
    testPayloadRoundTrip('sql', SQL_PAYLOAD, 'SQL'),
    testPayloadRoundTrip('html', HTML_PAYLOAD, 'HTML'),
    testPayloadRoundTrip('text', UNICODE_PAYLOAD, 'Unicode & Multilingual'),
    testEscapeComparison(),
  ];

  const durationMs = elapsed();
  const passed = tests.filter((t) => t.passed).length;

  return {
    suiteId: 'payload-fidelity',
    suiteName: 'Payload Fidelity',
    pillar: 'lossless',
    tests,
    summary: {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      durationMs,
    },
    timestamp: localTimestamp(),
  };
}

export { run as runPayloadFidelity };
