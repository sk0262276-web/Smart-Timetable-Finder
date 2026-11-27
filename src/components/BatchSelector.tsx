import { AlertCircle, CheckCircle2, Hash, Users } from 'lucide-react';
import {
  BATCHES,
  identifyBatchFromRollNumber,
  OFFICIAL_ROLL_RANGES,
  type BatchIdentificationMode,
  type BatchValue,
  type DepartmentCode,
  type SemesterValue,
} from '../types/timetable';

interface BatchSelectorProps {
  department: DepartmentCode;
  semester: SemesterValue | '';
  mode: BatchIdentificationMode;
  manualBatch: BatchValue | '';
  rollNumber: string;
  error?: string;
  onModeChange: (mode: BatchIdentificationMode) => void;
  onManualBatchChange: (batch: BatchValue) => void;
  onRollNumberChange: (rollNumber: string) => void;
}

export function BatchSelector({
  department,
  semester,
  mode,
  manualBatch,
  rollNumber,
  error,
  onModeChange,
  onManualBatchChange,
  onRollNumberChange,
}: BatchSelectorProps) {
  const isITDepartment = department === 'IT';
  const isSeventhSemester = department === 'CSE' && semester === '7';
  const isRollNumberDisabled = isITDepartment || isSeventhSemester;
  const activeMode: BatchIdentificationMode = isRollNumberDisabled
    ? 'manual'
    : mode;

  const liveMatch =
    activeMode === 'rollNumber' && rollNumber.trim() !== ''
      ? identifyBatchFromRollNumber(semester, rollNumber, department)
      : null;

  const semesterRanges =
    department === 'CSE' && semester ? OFFICIAL_ROLL_RANGES[semester] : undefined;
  const rollPlaceholder =
    semester === '5' ? 'e.g., 11000124001' : 'e.g., 11000125001';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-800">
          Batch Identification
        </span>
        <span className="text-xs text-slate-500">
          {isITDepartment
            ? 'Manual selection required for IT Department'
            : isSeventhSemester
              ? 'Manual selection required for 7th Semester'
              : 'Choose manually or enter your roll number'}
        </span>
      </div>

      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Batch identification method"
        className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'manual'}
          onClick={() => onModeChange('manual')}
          className={`flex min-h-[40px] items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
            activeMode === 'manual'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Select Batch</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'rollNumber'}
          disabled={isRollNumberDisabled}
          onClick={() => onModeChange('rollNumber')}
          title={
            isITDepartment
              ? 'Automatic roll number identification is not available for IT Department yet'
              : isSeventhSemester
                ? 'Automatic roll number identification is not available for 7th Semester'
                : undefined
          }
          className={`flex min-h-[40px] items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-45 ${
            activeMode === 'rollNumber'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Enter Roll Number</span>
        </button>
      </div>

      {/* Mode Content */}
      {activeMode === 'manual' ? (
        <div className="space-y-2">
          <div
            role="radiogroup"
            aria-label="Select your batch"
            className="grid grid-cols-2 gap-3"
          >
            {BATCHES.map((batch) => {
              const isSelected = manualBatch === batch;
              return (
                <button
                  key={batch}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onManualBatchChange(batch)}
                  className={`flex min-h-[46px] items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/70 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{batch}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-blue-700 bg-blue-700'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {isITDepartment && (
            <p className="text-xs text-slate-500">
              Automatic roll number lookup is not available for IT Department yet, so please select Batch I or Batch II manually.
            </p>
          )}

          {isSeventhSemester && (
            <p className="text-xs text-slate-500">
              Official roll number ranges are not available for 7th Semester yet, so please select Batch I or Batch II manually.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="roll-number-input" className="sr-only">
            College Roll Number
          </label>
          <input
            id="roll-number-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={rollNumber}
            onChange={(e) => onRollNumberChange(e.target.value)}
            placeholder={rollPlaceholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'batch-error' : 'roll-number-hint'}
            className={`min-h-[46px] w-full rounded-lg border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              error
                ? 'border-red-500 focus:border-red-600'
                : 'border-slate-200 focus:border-blue-700'
            }`}
          />

          {liveMatch?.batch && !error ? (
            <p
              id="roll-number-hint"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"
            >
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>Identified as {liveMatch.batch}</span>
            </p>
          ) : (
            <p id="roll-number-hint" className="text-xs text-slate-500">
              {semesterRanges
                ? `Official CSE range: ${semesterRanges.batchI.min}–${semesterRanges.batchII.max}`
                : 'Select 3rd or 5th Semester above to validate your roll number automatically.'}
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          id="batch-error"
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
