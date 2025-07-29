/**
 * @file A custom React hook for tracking the state of a CSS media query.
 */
import { useState, useEffect } from 'react';

/**
 * A React hook that determines if the document currently matches a given media query string.
 * It sets up a listener for changes to the media query state and cleans up after itself.
 *
 * @param query - The media query string to match (e.g., '(min-width: 768px)').
 * @returns `true` if the document matches the media query, otherwise `false`.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set the initial value on component mount
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    // For backwards compatibility with older browsers like Safari < 14,
    // we use the deprecated `addListener` and `removeListener` methods.
    // Modern browsers use `addEventListener` and `removeEventListener`.
    if (media.addListener) {
        media.addListener(listener);
    } else {
        media.addEventListener('change', listener);
    }
    
    return () => {
        if (media.removeListener) {
            media.removeListener(listener);
        } else {
            media.removeEventListener('change', listener);
        }
    };
  }, [matches, query]);

  return matches;
};
