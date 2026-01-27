"use client";

import { useState, useEffect, useCallback } from "react";
import { List, X } from "lucide-react";

interface Heading {
  id: string;
  text: string;
}

export function ArticleToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const h2s = article.querySelectorAll("h2[id]");
    const items: Heading[] = Array.from(h2s).map((el) => ({
      id: el.id,
      text: el.textContent || "",
    }));
    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (headings.length < 2) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[min(320px,90vw)] max-h-[60vh] overflow-y-auto rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-2">
            <nav aria-label="Table of contents">
              <ul className="space-y-0.5">
                {headings.map(({ id, text }) => (
                  <li key={id}>
                    <button
                      onClick={() => handleClick(id)}
                      className={`w-full text-left px-3 min-h-[44px] flex items-center rounded-md text-sm transition-colors ${
                        activeId === id
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <button
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center gap-2 px-4 min-h-[44px] rounded-full border bg-background/95 backdrop-blur-sm shadow-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isOpen ? "Close table of contents" : "Open table of contents"}
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
          <span>Sections</span>
        </button>
      </div>
    </>
  );
}
