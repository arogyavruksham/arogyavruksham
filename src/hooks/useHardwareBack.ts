'use client'

import { useEffect, useRef } from 'react';

/**
 * Hook to intercept the mobile hardware back button and close a modal instead of navigating back.
 * It adds a hash to the URL without triggering a Next.js navigation, and listens to the popstate event.
 * 
 * @param isOpen Whether the modal is currently open
 * @param close Callback to close the modal
 * @param hashId A unique identifier for the hash (e.g. 'cart', 'menu')
 */
export function useHardwareBack(isOpen: boolean, close: () => void, hashId: string) {
  const isBackButtonPressed = useRef(false);
  const closeRef = useRef(close);

  // Update the ref to the latest close function on every render
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = `#${hashId}`;

    if (isOpen) {
      // Add hash to URL without triggering a page reload or Next.js navigation
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', window.location.pathname + window.location.search + hash);
      }

      const handlePopState = () => {
        // When back button is pressed, the hash will be removed by the browser
        if (window.location.hash !== hash) {
          isBackButtonPressed.current = true;
          closeRef.current();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        
        // If the modal was closed programmatically (not via back button),
        // we should remove the dummy state from the history stack
        if (!isBackButtonPressed.current && window.location.hash === hash) {
          window.history.back();
        }
        
        isBackButtonPressed.current = false;
      };
    }
  }, [isOpen, hashId]);
}
