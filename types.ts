
export interface FuseMatch {
    indices: readonly [number, number][];
    key?: string;
    refIndex?: number;
    value?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
  description: string;
  coverImage: string;
  /** Can be a placeholder ('#'), a data URL for uploaded files, or a link to an external resource. */
  fileUrl: string;
  textContent?: string;
  matches?: readonly FuseMatch[]; // Optional array of match details from Fuse.js
}