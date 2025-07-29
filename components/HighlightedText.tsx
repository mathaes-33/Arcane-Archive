/**
 * @file A component for rendering text with parts of it highlighted based on Fuse.js match data.
 */
import React from 'react';
import { FuseMatch } from '@/types';

interface HighlightedTextProps {
  text: string;
  matches?: readonly FuseMatch[];
  matchKey: string;
}

/**
 * Renders a string, wrapping any parts that match the Fuse.js search results in a <mark> tag.
 * @param {string} text - The full text to display.
 * @param {readonly FuseMatch[]} [matches] - The array of match objects from Fuse.js.
 * @param {string} matchKey - The key ('title', 'author', etc.) to look for within the matches array.
 * @returns A React fragment containing the text with highlighted segments.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, matches, matchKey }) => {
  // If there are no matches, return the original text without any special formatting.
  if (!matches || matches.length === 0) {
    return <>{text}</>;
  }

  // Find the specific match details for the given key (e.g., 'title').
  const match = matches.find(m => m.key === matchKey);
  
  // If there's no match for this key, or the indices are missing, return the original text.
  if (!match || !match.indices || match.indices.length === 0) {
    return <>{text}</>;
  }

  // Fuse.js provides sorted, non-overlapping indices for the matches.
  const indices = match.indices;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Iterate through the indices to build an array of strings and highlighted components.
  indices.forEach(([start, end], i) => {
    // Add the part of the string before the current match.
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }

    // Add the matched part, wrapped in a styled <mark> tag.
    parts.push(
      <mark key={i} className="bg-gold-500/40 text-gold-100 rounded-sm px-0.5 py-0">
        {text.substring(start, end + 1)}
      </mark>
    );

    // Update the last index to the end of the current match.
    lastIndex = end + 1;
  });

  // Add the remaining part of the string after the last match.
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};