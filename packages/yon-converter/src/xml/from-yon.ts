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
 * YON → XML Converter
 * 
 * Converts YON documents to XML format.
 */

import { parse, type YonDocument } from '@younndai/yon-parser';
import { walkDocument } from '../ast-walker.js';
import type { WalkOptions } from '../types.js';

/**
 * XML output options.
 */
export interface YonToXmlOptions extends WalkOptions {
  /** Indentation (default: 2) */
  indent?: number;
  /** Root element name if data doesn't have one (default: 'root') */
  rootName?: string;
  /** XML declaration (default: true) */
  declaration?: boolean;
}

/**
 * Encode XML entities.
 */
function encodeXmlEntities(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if a key is an attribute (starts with @).
 */
function isAttribute(key: string): boolean {
  return key.startsWith('@');
}

/**
 * Check if a key is text content.
 */
function isTextContent(key: string): boolean {
  return key === '#text' || key === '_text' || key === '$text';
}

/**
 * Convert object to XML string.
 */
function objectToXml(
  obj: unknown,
  tagName: string,
  indentLevel: number,
  indentSize: number
): string {
  const indent = ' '.repeat(indentLevel * indentSize);
  const childIndent = ' '.repeat((indentLevel + 1) * indentSize);
  
  if (obj === null || obj === undefined) {
    return `${indent}<${tagName}/>\n`;
  }
  
  if (typeof obj !== 'object') {
    const encoded = encodeXmlEntities(String(obj));
    return `${indent}<${tagName}>${encoded}</${tagName}>\n`;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => objectToXml(item, tagName, indentLevel, indentSize)).join('');
  }
  
  const record = obj as Record<string, unknown>;
  
  // Separate attributes, text, and children
  const attributes: string[] = [];
  let textContent = '';
  const children: string[] = [];
  
  for (const [key, value] of Object.entries(record)) {
    if (isAttribute(key)) {
      const attrName = key.slice(1);
      const attrValue = encodeXmlEntities(String(value));
      attributes.push(`${attrName}="${attrValue}"`);
    } else if (isTextContent(key)) {
      textContent = String(value);
    } else {
      // Child element
      if (Array.isArray(value)) {
        for (const item of value) {
          children.push(objectToXml(item, key, indentLevel + 1, indentSize));
        }
      } else {
        children.push(objectToXml(value, key, indentLevel + 1, indentSize));
      }
    }
  }
  
  // Build opening tag
  let openTag = tagName;
  if (attributes.length > 0) {
    openTag += ' ' + attributes.join(' ');
  }
  
  // Self-closing if no content
  if (!textContent && children.length === 0) {
    return `${indent}<${openTag}/>\n`;
  }
  
  // Text-only content
  if (textContent && children.length === 0) {
    const encoded = encodeXmlEntities(textContent);
    return `${indent}<${openTag}>${encoded}</${tagName}>\n`;
  }
  
  // Mixed or element-only content
  let result = `${indent}<${openTag}>`;
  
  if (textContent) {
    result += '\n' + childIndent + encodeXmlEntities(textContent) + '\n';
  } else {
    result += '\n';
  }
  
  result += children.join('');
  result += `${indent}</${tagName}>\n`;
  
  return result;
}

/**
 * Convert YON to XML format.
 * 
 * @param input - YON string or document
 * @param options - Conversion options
 * @returns XML string
 */
export function yonToXml(
  input: string | YonDocument,
  options: YonToXmlOptions = {}
): string {
  const { 
    indent = 2, 
    rootName = 'root', 
    declaration = true,
    ...walkOptions 
  } = options;
  
  const document = typeof input === 'string' ? parse(input) : input;
  const data = walkDocument(document, walkOptions);
  
  let xml = '';
  
  if (declaration) {
    xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
  }
  
  // Determine root element
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const keys = Object.keys(data as Record<string, unknown>);
    
    if (keys.length === 1 && !isAttribute(keys[0]!) && !isTextContent(keys[0]!)) {
      // Single root element
      const rootTag = keys[0]!;
      xml += objectToXml((data as Record<string, unknown>)[rootTag], rootTag, 0, indent);
    } else {
      // Wrap in root element
      xml += objectToXml(data, rootName, 0, indent);
    }
  } else {
    // Wrap array or primitive in root element
    xml += objectToXml(data, rootName, 0, indent);
  }
  
  return xml;
}
