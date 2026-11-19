import { useState, type FormEvent } from 'react';
import { Header } from './components/Header';
import { TimetableDisplay } from './components/TimetableDisplay';
import { TimetableFinderForm } from './components/TimetableFinderForm';
import {
  DEPARTMENTS,
  identifyBatchFromRollNumber,
  SEMESTERS,
  type BatchValue,
  type FormValidationErrors,
  type TimetableFormState,
  type TimetableQuery,
} from './types/timetable';

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialFormState(): TimetableFormState {
  return {
    department: 'CSE',
    semester: '',
    batchMode: 'manual',
    manualBatch: '',
    rollNumber: '',
    date: getTodayIsoDate(),
  };
}

export default function App() {
  const [formState, setFormState] = useState<TimetableFormState>(
    createInitialFormState
  );
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [submittedQuery, setSubmittedQuery] = useState<TimetableQuery | null>(
    null
  );

  const hasUserInput =
    formState.semester !== '' ||
    formState.manualBatch !== '' ||
    formState.rollNumber.trim() !== '' ||
    formState.date !== getTodayIsoDate() ||
    submittedQuery !== null;

  const handleClearError = (field: keyof FormValidationErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleReset = () => {
    setFormState(createInitialFormState());
    setErrors({});
    setSubmittedQuery(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: FormValidationErrors = {};
    const effectiveBatchMode =
      formState.semester === '7' ? 'manual' : formState.batchMode;

    if (!formState.semester) {
      nextErrors.semester = 'Please select your semester (3rd, 5th, or 7th).';
    }

    let resolvedBatch: BatchValue | null = null;
    let enteredRollNumber: string | undefined;

    if (effectiveBatchMode === 'manual') {
      if (!formState.manualBatch) {
        nextErrors.batch = 'Please choose either Batch I or Batch II.';
      } else {
        resolvedBatch = formState.manualBatch;
      }
    } else {
      const rollResult = identifyBatchFromRollNumber(
        formState.semester,
        formState.rollNumber
      );
      if (!rollResult.batch) {
        nextErrors.batch =
          rollResult.error ?? 'Unable to identify batch from roll number.';
      } else {
        resolvedBatch = rollResult.batch;
        enteredRollNumber = formState.rollNumber.trim();
      }
    }

    if (!formState.date) {
      nextErrors.date = 'Please pick a date to look up classes.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const departmentOption = DEPARTMENTS.find(
      (d) => d.code === formState.department
    );
    const semesterOption = SEMESTERS.find(
      (s) => s.value === formState.semester
    );

    if (
      !departmentOption ||
      !semesterOption ||
      !formState.semester ||
      !resolvedBatch
    ) {
      return;
    }

    setErrors({});
    setSubmittedQuery({
      department: formState.department,
      departmentLabel: departmentOption.label,
      semester: formState.semester,
      semesterLabel: semesterOption.label,
      batchMode: effectiveBatchMode,
      batchLabel: resolvedBatch,
      rollNumber: enteredRollNumber,
      date: formState.date,
    });

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const target = document.getElementById('timetable-section');
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      target?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div id="top" className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header onReset={handleReset} hasUserInput={hasUserInput} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page Intro */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-blue-700">
            Department of Computer Science &amp; Engineering
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
            Find Your Daily Class Timetable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Pick your semester, identify your batch manually or by roll number, and select a date to view your daily schedule.
          </p>
        </div>

        {/* Two-Column Workspace */}
        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <TimetableFinderForm
              formState={formState}
              errors={errors}
              onChange={setFormState}
              onClearError={handleClearError}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-7">
            <TimetableDisplay
              submittedQuery={submittedQuery}
              onClearQuery={() => setSubmittedQuery(null)}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Smart College Timetable Finder</span>
          <span>CSE Department · Semesters 3, 5 &amp; 7</span>
        </div>
      </footer>
    </div>
  );
}
