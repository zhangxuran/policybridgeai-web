/**
 * Utility functions for handling Markdown content
 */

/**
 * Remove all Markdown formatting markers from text, leaving only plain text
 * This function strips common Markdown syntax while preserving the actual content
 * EXCEPT for bold text which is converted to HTML <strong> tags
 * 
 * @param text - The text containing Markdown formatting
 * @returns Plain text with all Markdown markers removed (bold converted to <strong>)
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';

  let result = text;

  // Convert bold markers to HTML strong tags FIRST (before removing other formatting)
  // **text** or __text__ -> <strong>text</strong>
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Remove italic markers: *text* or _text_ -> text
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough: ~~text~~ -> text
  result = result.replace(/~~([^~]+)~~/g, '$1');

  // Remove inline code: `code` -> code
  result = result.replace(/`([^`]+)`/g, '$1');

  // Remove code blocks: ```code``` -> code
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    // Extract content between ``` markers
    return match.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
  });

  // Remove headers: # text -> text
  result = result.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // Remove blockquotes: > text -> text
  result = result.replace(/^>\s+(.+)$/gm, '$1');

  // Remove unordered list markers: - text or * text -> text
  result = result.replace(/^[\s]*[-*+]\s+(.+)$/gm, '$1');

  // Remove ordered list markers: 1. text -> text
  result = result.replace(/^[\s]*\d+\.\s+(.+)$/gm, '$1');

  // Remove horizontal rules: --- or *** or ___
  result = result.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');

  // Remove link markers but keep text: [text](url) -> text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove image markers: ![alt](url) -> alt
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove reference-style links: [text][ref] -> text
  result = result.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

  // NOTE: We keep <strong> tags, so don't remove HTML tags here
  // Only remove non-strong HTML tags
  result = result.replace(/<(?!strong|\/strong)[^>]+>/g, '');

  // Clean up multiple consecutive newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace
  result = result.trim();

  return result;
}

/**
 * Check if text contains Markdown formatting
 * 
 * @param text - The text to check
 * @returns true if text contains Markdown markers
 */
export function hasMarkdown(text: string): boolean {
  if (!text) return false;

  const markdownPatterns = [
    /\*\*[^*]+\*\*/,  // Bold
    /__[^_]+__/,      // Bold (alternative)
    /\*[^*]+\*/,      // Italic
    /_[^_]+_/,        // Italic (alternative)
    /~~[^~]+~~/,      // Strikethrough
    /`[^`]+`/,        // Inline code
    /```[\s\S]*?```/, // Code block
    /^#{1,6}\s+/m,    // Headers
    /^>\s+/m,         // Blockquotes
    /^[\s]*[-*+]\s+/m, // Unordered lists
    /^[\s]*\d+\.\s+/m, // Ordered lists
    /\[([^\]]+)\]\([^)]+\)/, // Links
    /!\[([^\]]*)\]\([^)]+\)/ // Images
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}