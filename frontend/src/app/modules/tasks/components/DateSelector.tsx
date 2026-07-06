"use client";

import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

// ─── Utilities ────────────────────────────────────────────────────────────────

function getLocalDateStr(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateStr: string, n: number): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() + n);
  return getLocalDateStr(d);
}

function formatDisplay(dateStr: string): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateStr();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useTaskStore();
  const today = getLocalDateStr();

  const goBack = () => setSelectedDate(addDays(selectedDate, -1));
  const goForward = () => setSelectedDate(addDays(selectedDate, 1));
  const goToday = () => setSelectedDate(today);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4">
      {/* Calendar icon + display */}
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CalendarDays size={20} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Viewing tasks for
          </p>
          <p className="text-base font-semibold text-foreground">
            {formatDisplay(selectedDate)}
            {isToday(selectedDate) && (
              <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Visible Native Date Input */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
          aria-label="Pick a date"
        />

        <button
          onClick={goToday}
          disabled={isToday(selectedDate)}
          className="inline-flex items-center px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Today
        </button>

        <button
          onClick={goForward}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
