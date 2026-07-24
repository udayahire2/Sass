"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export type TOCItemType = {
  title: React.ReactNode;
  url: string;
  depth: number;
};

export type TOCMinimapProps = {
  items: TOCItemType[];
  className?: string;
};

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let current = el?.parentElement;
  while (current && current !== document.body && current !== document.documentElement) {
    const style = getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY + style.overflow)) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

export function TOCMinimap({ items, className }: TOCMinimapProps) {
  const itemIds = useMemo(
    () => items.map((item) => item.url.replace("#", "")),
    [items]
  );

  const activeHeading = useActiveHeading(itemIds);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const url = e.currentTarget.getAttribute("href") ?? "";
      scrollToHeading(url);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const list = e.currentTarget;
      const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
      if (!links.length) return;

      const currentIndex = links.findIndex(
        (link) => link === document.activeElement
      );

      let nextIndex = -1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = links.length - 1;
          break;
      }

      if (nextIndex >= 0 && links[nextIndex]) {
        links[nextIndex].focus();
      }
    },
    []
  );

  const renderedItems = useMemo(
    () =>
      items.map((item) => {
        const id = item.url.replace("#", "");
        const isActive = activeHeading === id;

        return (
          <li key={item.url} className="flex py-1">
            <a
              href={item.url}
              data-depth={item.depth}
              data-active={isActive}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "line-clamp-2 w-full rounded-sm px-1.5 py-0.5 text-xs transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "text-muted-foreground hover:text-foreground data-[active=true]:bg-accent/50 data-[active=true]:font-medium data-[active=true]:text-primary",
                "data-[depth=3]:pl-4 data-[depth=4]:pl-7"
              )}
              onClick={handleClick}
            >
              {item.title}
            </a>
          </li>
        );
      }),
    [items, activeHeading, handleClick]
  );

  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className={cn("ml-auto w-18", className)}>
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCardTrigger asChild>
          <div className="flex max-h-[50dvh] cursor-pointer flex-col gap-3 overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-popup-open:opacity-0">
            {items.map((item) => {
              const id = item.url.replace("#", "");
              const isActive = activeHeading === id;
              return (
                <div
                  key={item.url}
                  data-depth={item.depth}
                  data-active={isActive}
                  className={cn(
                    "h-0.5 w-6 shrink-0 rounded-xs bg-ring/50 transition-all duration-200",
                    "data-[depth=3]:ml-2 data-[depth=3]:w-4",
                    "data-[depth=4]:ml-4 data-[depth=4]:w-2",
                    "data-[active=true]:w-7 data-[active=true]:bg-primary"
                  )}
                />
              );
            })}
          </div>
        </HoverCardTrigger>

        <HoverCardContent
          className="w-56 overflow-hidden p-0 duration-200 data-[side=left]:slide-in-from-right-3 data-[side=left]:slide-out-to-right-3 data-open:zoom-in-100 data-closed:zoom-out-100"
          align="start"
          alignOffset={0}
          side="left"
          sideOffset={-60}
        >
          <div className="flex max-h-[50dvh] overflow-y-auto overscroll-contain">
            <ul
              role="list"
              className="flex size-full flex-col px-4 py-3 text-sm"
              onKeyDown={handleKeyDown}
            >
              {renderedItems}
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </nav>
  );
}

export function useActiveHeading(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const elementsRef = useRef<HTMLElement[]>([]);

  // 1. Cache elements when itemIds change
  useEffect(() => {
    elementsRef.current = itemIds
      .map(
        (id) =>
          document.getElementById(id) ??
          (document.querySelector(`[data-toc-id="${id}"]`) as HTMLElement | null)
      )
      .filter(Boolean) as HTMLElement[];
  }, [itemIds]);

  // 2. IntersectionObserver for active heading tracking
  useEffect(() => {
    if (!itemIds.length) return;

    const firstEl = elementsRef.current[0];
    const scrollParent = getScrollParent(firstEl);
    const rootElement = scrollParent === window ? null : (scrollParent as HTMLElement);

    const visibleHeadingsMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id =
            entry.target.id || entry.target.getAttribute("data-toc-id");
          if (!id) return;

          if (entry.isIntersecting) {
            visibleHeadingsMap.set(id, entry.boundingClientRect.top);
          } else {
            visibleHeadingsMap.delete(id);
          }
        });

        let targetId: string | null = null;

        if (visibleHeadingsMap.size > 0) {
          const sorted = Array.from(visibleHeadingsMap.entries()).sort(
            (a, b) => a[1] - b[1]
          );
          targetId = sorted[0][0];
        } else if (elementsRef.current.length > 0) {
          const OFFSET = 120;
          const visible = elementsRef.current.filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top <= OFFSET;
          });

          const current =
            visible.length > 0
              ? visible[visible.length - 1]
              : elementsRef.current[0];

          targetId =
            current?.id || current?.getAttribute("data-toc-id") || null;
        }

        if (targetId && targetId !== activeIdRef.current) {
          activeIdRef.current = targetId;
          setActiveId(targetId);
        }
      },
      {
        root: rootElement,
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0, 1],
      }
    );

    elementsRef.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [itemIds]);

  return activeId;
}

function scrollToHeading(url: string) {
  const targetId = url.replace("#", "");
  history.replaceState(null, "", url);

  let element =
    document.getElementById(targetId) ||
    (document.querySelector(`[data-toc-id="${targetId}"]`) as HTMLElement | null);

  if (!element) {
    const index = parseInt(targetId.replace("heading-", ""), 10);
    if (!isNaN(index)) {
      const editorEl = document.querySelector(".ProseMirror");
      if (editorEl) {
        element = editorEl.querySelectorAll("h1, h2, h3, h4")[
          index
        ] as HTMLElement | null;
      }
    }
  }

  if (element) {
    const HEADER_OFFSET = 80;
    const scrollParent = getScrollParent(element);

    if (scrollParent === window) {
      const top = window.scrollY + element.getBoundingClientRect().top - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      const container = scrollParent as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const top = container.scrollTop + (elementRect.top - containerRect.top) - HEADER_OFFSET;

      container.scrollTo({ top, behavior: "smooth" });
    }
  }
}
