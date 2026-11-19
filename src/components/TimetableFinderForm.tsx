import type { FormEvent } from 'react';
import { AlertCircle, Calendar, Search } from 'lucide-react';
import {
  DEPARTMENTS,
  SEMESTERS,
  type BatchIdentificationMode,
  type BatchValue,
  type DepartmentCode,
  type FormValidationErrors,
  type SemesterValue,
  type TimetableFormState,
} from '../types/timetable';
import { BatchSelector } from './BatchSelector';

interface TimetableFinderFormProps {
  formState: TimetableFormState;
  errors: FormValidationErrors;
  onChange: (updater: (prev: TimetableFormState) => TimetableFormState) => void;
  onClearError: (field: keyof FormValidationErrors) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

function getOffsetIsoDate(offsetDays: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TimetableFinderForm({
  formState,
  errors,
  onChange,
  onClearError,
  onSubmit,
}: TimetableFinderFormProps) {
  const todayIso = getOffsetIsoDate(0);
  const tomorrowIso = getOffsetIsoDate(1);

  const handleDepartmentChange = (department: DepartmentCode) => {
    onChange((prev) => ({ ...prev, department }));
  };

  const handleSemesterChange = (semester: SemesterValue | '') => {
    onClearError('semester');
    onClearError('batch');
    onChange((prev) => ({
      ...prev,
      semester,
      batchMode: semester === '7' ? 'manual' : prev.batchMode,
    }));
  };

  const handleBatchModeChange = (batchMode: BatchIdentificationMode) => {
    onClearError('batch');
    onChange((prev) => ({ ...prev, batchMode }));
  };

  const handleManualBatchChange = (manualBatch: BatchValue) => {
    onClearError('batch');
    onChange((prev) => ({ ...prev, manualBatch }));
  };

  const handleRollNumberChange = (rollNumber: string) => {
    onClearError('batch');
    onChange((prev) => ({ ...prev, rollNumber }));
  };

  const handleDateChange = (date: string) => {
    onClearError('date');
    onChange((prev) => ({ ...prev, date }));
  };

  return (
    <section
      id="finder-form"
      aria-labelledby="finder-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2
          id="finder-heading"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Class Search Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Select your academic details to locate the schedule for a specific day.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
        {/* Department Dropdown */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="department-select"
              className="text-sm font-semibold text-slate-800"
            >
              Department
            </label>
            <span className="text-xs text-slate-500">Version 1 · CSE Focus</span>
          </div>
          <select
            id="department-select"
            value={formState.department}
            onChange={(e) =>
              handleDepartmentChange(e.target.value as DepartmentCode)
            }
            className="min-h-[46px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors duration-150 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="semester-select"
            className="block text-sm font-semibold text-slate-800"
          >
            Semester
          </label>
          <select
            id="semester-select"
            value={formState.semester}
            onChange={(e) =>
              handleSemesterChange(e.target.value as SemesterValue | '')
            }
            aria-invalid={Boolean(errors.semester)}
            aria-describedby={errors.semester ? 'semester-error' : undefined}
            className={`min-h-[46px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              formState.semester ? 'text-slate-900' : 'text-slate-500'
            } ${
              errors.semester
                ? 'border-red-500 focus:border-red-600'
                : 'border-slate-200 focus:border-blue-700'
            }`}
          >
            <option value="">Select semester</option>
            {SEMESTERS.map((sem) => (
              <option key={sem.value} value={sem.value}>
                {sem.label}
              </option>
            ))}
          </select>
          {errors.semester && (
            <p
              id="semester-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs font-medium text-red-600"
            >
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{errors.semester}</span>
            </p>
          )}
        </div>

        {/* Batch Identification (Manual or Roll Number) */}
        <BatchSelector
          semester={formState.semester}
          mode={formState.batchMode}
          manualBatch={formState.manualBatch}
          rollNumber={formState.rollNumber}
          error={errors.batch}
          onModeChange={handleBatchModeChange}
          onManualBatchChange={handleManualBatchChange}
          onRollNumberChange={handleRollNumberChange}
        />

        {/* Date Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="timetable-date"
              className="text-sm font-semibold text-slate-800"
            >
              Date
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDateChange(todayIso)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  formState.date === todayIso
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(tomorrowIso)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  formState.date === tomorrowIso
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="timetable-date"
              type="date"
              value={formState.date}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'date-error' : undefined}
              className={`min-h-[46px] w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.date
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-slate-200 focus:border-blue-700'
              }`}
            />
          </div>

          {errors.date && (
            <p
              id="date-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs font-medium text-red-600"
            >
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{errors.date}</span>
            </p>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800 active:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Find My Classes</span>
          </button>
        </div>
      </form>
    </section>
  );
}
