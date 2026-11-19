import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasUserInput: boolean;
}

export function Header({ onReset, hasUserInput }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          Smart College Timetable Finder
        </a>

        <nav
          aria-label="Page sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#finder-form"
            className="transition-colors duration-150 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Class Finder
          </a>
          <a
            href="#timetable-section"
            className="transition-colors duration-150 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Daily Timetable
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasUserInput}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>
    </header>
  );
}
