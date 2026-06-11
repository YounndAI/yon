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
 * @younndai/yon-converter
 *
 * XML → YON Converter
 * 
 * Converts XML documents to YON format.
 * Uses a simple parser without external dependencies.
 */

import type { JsonToYonOptions } from '../types.js';
import { jsonToYon } from '../json/to-yon.js';

/**
 * XML node representation.
 */
interface XmlNode {
  tag: string;
  attributes: Record<string, string>;
  children: (XmlNode | string)[];
}

/**
 * Simple XML parser.
 * 
 * Note: This is a basic parser for common XML. For production use with
 * complex XML (namespaces, DTDs, CDATA), consider a full XML parser.
 */
function parseXml(input: string): XmlNode | null {
  let pos = 0;
  
  const skipWhitespace = (): void => {
    while (pos < input.length && /\s/.test(input[pos]!)) {
      pos++;
    }
  };
  
  const parseAttributes = (): Record<string, string> => {
    const attrs: Record<string, string> = {};
    
    while (pos < input.length) {
      skipWhitespace();
      
      if (input[pos] === '>' || input[pos] === '/' || input[pos] === '?') {
        break;
      }
      
      // Parse attribute name
      let name = '';
      while (pos < input.length && /[a-zA-Z0-9_:-]/.test(input[pos]!)) {
        name += input[pos];
        pos++;
      }
      
      if (!name) break;
      
      skipWhitespace();
      
      if (input[pos] !== '=') {
        attrs[name] = 'true';
        continue;
      }
      pos++; // Skip =
      
      skipWhitespace();
      
      // Parse attribute value
      const quote = input[pos];
      if (quote !== '"' && quote !== "'") {
        throw new Error('Expected quote for attribute value');
      }
      pos++; // Skip opening quote
      
      let value = '';
      while (pos < input.length && input[pos] !== quote) {
        value += input[pos];
        pos++;
      }
      pos++; // Skip closing quote
      
      attrs[name] = decodeXmlEntities(value);
    }
    
    return attrs;
  };
  
  const parseNode = (): XmlNode | string | null => {
    skipWhitespace();
    
    if (pos >= input.length) return null;
    
    // Check for comment
    if (input.slice(pos, pos + 4) === '<!--') {
      const end = input.indexOf('-->', pos + 4);
      if (end === -1) throw new Error('Unclosed comment');
      pos = end + 3;
      return parseNode();
    }
    
    // Check for CDATA
    if (input.slice(pos, pos + 9) === '<![CDATA[') {
      const end = input.indexOf(']]>', pos + 9);
      if (end === -1) throw new Error('Unclosed CDATA');
      const content = input.slice(pos + 9, end);
      pos = end + 3;
      return content;
    }
    
    // Check for processing instruction
    if (input.slice(pos, pos + 2) === '<?') {
      const end = input.indexOf('?>', pos + 2);
      if (end === -1) throw new Error('Unclosed processing instruction');
      pos = end + 2;
      return parseNode();
    }
    
    // Check for DOCTYPE
    if (input.slice(pos, pos + 9) === '<!DOCTYPE') {
      let depth = 1;
      pos += 9;
      while (pos < input.length && depth > 0) {
        if (input[pos] === '<') depth++;
        if (input[pos] === '>') depth--;
        pos++;
      }
      return parseNode();
    }
    
    // Start of element
    if (input[pos] === '<') {
      pos++; // Skip <
      
      // Check for closing tag
      if (input[pos] === '/') {
        return null; // Closing tag, return to parent
      }
      
      // Parse tag name
      let tag = '';
      while (pos < input.length && /[a-zA-Z0-9_:-]/.test(input[pos]!)) {
        tag += input[pos];
        pos++;
      }
      
      if (!tag) throw new Error('Empty tag name');
      
      const attributes = parseAttributes();
      
      skipWhitespace();
      
      // Self-closing tag
      if (input[pos] === '/') {
        pos++; // Skip /
        if (input[pos] !== '>') throw new Error('Expected >');
        pos++; // Skip >
        return { tag, attributes, children: [] };
      }
      
      if (input[pos] !== '>') throw new Error('Expected >');
      pos++; // Skip >
      
      // Parse children
      const children: (XmlNode | string)[] = [];
      
      while (pos < input.length) {
        skipWhitespace();
        
        // Check for closing tag
        if (input.slice(pos, pos + 2 + tag.length + 1) === `</${tag}>`) {
          pos += 2 + tag.length + 1;
          break;
        }
        
        if (input[pos] === '<') {
          const child = parseNode();
          if (child === null) {
            // We hit a closing tag that wasn't ours
            // Find and skip our closing tag
            const closeTag = `</${tag}>`;
            const closeIndex = input.indexOf(closeTag, pos);
            if (closeIndex !== -1) {
              pos = closeIndex + closeTag.length;
            }
            break;
          }
          children.push(child);
        } else {
          // Text content
          let text = '';
          while (pos < input.length && input[pos] !== '<') {
            text += input[pos];
            pos++;
          }
          text = text.trim();
          if (text) {
            children.push(decodeXmlEntities(text));
          }
        }
      }
      
      return { tag, attributes, children };
    }
    
    return null;
  };
  
  return parseNode() as XmlNode | null;
}

/**
 * Decode XML entities.
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Convert XML node to plain object.
 * Returns a string if the element only contains text (no attributes, no child elements).
 */
function xmlToObject(node: XmlNode): Record<string, unknown> | string {
  // Check if this is a text-only element (no attributes, only text children)
  const hasAttributes = Object.keys(node.attributes).length > 0;
  const hasElementChildren = node.children.some(c => typeof c !== 'string');
  const textContent = node.children
    .filter((c): c is string => typeof c === 'string')
    .join('')
    .trim();
  
  // If text-only element with no attributes, return just the text
  if (!hasAttributes && !hasElementChildren && textContent) {
    return textContent;
  }
  
  const result: Record<string, unknown> = {};
  
  // Add attributes with @ prefix
  for (const [key, value] of Object.entries(node.attributes)) {
    result[`@${key}`] = value;
  }
  
  // Group children by tag
  const childGroups: Record<string, unknown[]> = {};
  
  for (const child of node.children) {
    if (typeof child !== 'string') {
      const childObj = xmlToObject(child);
      if (!childGroups[child.tag]) {
        childGroups[child.tag] = [];
      }
      childGroups[child.tag]!.push(childObj);
    }
  }
  
  // Add text content only if there are also child elements (mixed content)
  if (textContent && hasElementChildren) {
    result['#text'] = textContent;
  }
  
  // Add children (unwrap single-item arrays)
  for (const [tag, items] of Object.entries(childGroups)) {
    result[tag] = items.length === 1 ? items[0] : items;
  }
  
  return result;
}

/**
 * Convert XML input to YON format.
 * 
 * @param input - XML string
 * @param options - Conversion options
 * @returns YON string
 */
export function xmlToYon(
  input: string,
  options: JsonToYonOptions = {}
): string {
  const root = parseXml(input.trim());
  
  if (!root) {
    throw new Error('Failed to parse XML');
  }
  
  const data = { [root.tag]: xmlToObject(root) };
  
  return jsonToYon(data, {
    ...options,
    kind: options.kind ?? 'doc',
  });
}
