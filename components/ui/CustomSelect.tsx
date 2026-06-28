"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

export type SelectOption = { id: string; label: string };

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  searchable = false,
}: {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.id === value);

  const filtered =
    searchable && query
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => inputRef.current?.focus(), 30);
    if (!open) setQuery("");
  }, [open, searchable]);

  const triggerClass = `w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
    disabled
      ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
      : open
        ? "bg-white border-[#0E7C8B] ring-2 ring-[#0E7C8B]/10 shadow-sm"
        : "bg-white border-slate-200 text-slate-700 hover:border-[#0E7C8B] hover:shadow-sm"
  }`;

  return (
    <div ref={ref} className="relative">
      {open && searchable ? (
        <div className={triggerClass}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selected ? selected.label : placeholder}
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
          />
          <FaChevronDown size={11} className="flex-shrink-0 rotate-180 text-[#0E7C8B]" />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
          className={triggerClass}
        >
          <span className={selected ? "text-slate-800" : disabled ? "text-slate-300" : "text-slate-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <FaChevronDown
            size={11}
            className={`flex-shrink-0 transition-transform duration-200 ${disabled ? "text-slate-200" : "text-slate-400"}`}
          />
        </button>
      )}

      {open && (
        <div className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    value === opt.id
                      ? "bg-[#e6f7fa] text-[#0E7C8B] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                  {value === opt.id && <FaCheck size={10} className="text-[#0E7C8B]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
