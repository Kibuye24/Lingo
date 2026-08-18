"use client";

import { useState } from "react";

/**
 * A month grid of practice days, expanded from the week strip on the home
 * screen. Shows more than the last seven days so a run feels like a run —
 * active days filled, today ringed, with month-to-month paging.
 */
export default function StreakCalendar({ activeDays }: { activeDays: string[] }) {
  const active = new Set(activeDays);
  const [offset, setOffset] = useState(0); // months back from the current one

  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();

  const monthName = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = now.toISOString().slice(0, 10);

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setOffset((o) => o - 1)}
          aria-label="Previous month"
          className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/15"
        >
          ‹
        </button>
        <span className="text-sm font-semibold">{monthName}</span>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          aria-label="Next month"
          disabled={offset >= 0}
          className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/15 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {["M", "D", "W", "D", "V", "Z", "Z"].map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-white/60">
            {d}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`b${i}`} />;
          const on = active.has(iso);
          const isToday = iso === todayIso;
          return (
            <span
              key={iso}
              className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs ${
                on ? "bg-white font-semibold text-accent" : "text-white/75"
              } ${isToday && !on ? "ring-1 ring-white/70" : ""}`}
            >
              {Number(iso.slice(-2))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
