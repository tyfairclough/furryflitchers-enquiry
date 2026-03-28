"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { TextInput } from "@/components/ui/Field";

type Props = {
  breeds: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function BreedAutocomplete({
  breeds,
  value,
  onChange,
  disabled,
  placeholder = "Start typing to search breeds",
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return breeds.slice(0, 80);
    return breeds.filter((b) => b.toLowerCase().includes(q)).slice(0, 80);
  }, [breeds, value]);

  const displayHighlight = Math.min(
    highlight,
    Math.max(0, filtered.length - 1),
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <TextInput
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={(e) => {
          setHighlight(0);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
          }
          if (e.key === "Escape") {
            setOpen(false);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) =>
              Math.min(Math.max(0, filtered.length - 1), h + 1),
            );
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
          }
          if (e.key === "Enter" && open && filtered.length > 0) {
            e.preventDefault();
            const pickName = filtered[displayHighlight] ?? filtered[0];
            if (pickName) pick(pickName);
          }
        }}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {filtered.map((b, i) => (
            <li key={b} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === displayHighlight}
                className={[
                  "flex w-full px-3 py-2 text-left text-sm text-foreground",
                  i === displayHighlight ? "bg-muted/50" : "hover:bg-muted/30",
                ].join(" ")}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  pick(b);
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
