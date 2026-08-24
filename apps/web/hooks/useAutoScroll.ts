"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * A reusable hook that automatically scrolls a chat container or bottom marker
 * into view whenever the provided dependencies (e.g. messages list) update.
 *
 * @param dependencies Array of values that trigger auto-scrolling on change.
 * @param behavior Scroll behavior ('smooth' | 'auto'). Defaults to 'smooth'.
 */
export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: unknown[],
  behavior: ScrollBehavior = "smooth"
) {
  const containerRef = useRef<T | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(
    (customBehavior?: ScrollBehavior) => {
      const activeBehavior = customBehavior ?? behavior;
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: activeBehavior,
          block: "end",
        });
      } else if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: activeBehavior,
        });
      }
    },
    [behavior]
  );

  useEffect(() => {
    scrollToBottom();
  }, [dependencies, scrollToBottom]);

  return {
    containerRef,
    bottomRef,
    scrollToBottom,
  };
}

export default useAutoScroll;
