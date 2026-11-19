import {
  CalendarClock,
  CalendarDays,
  CalendarOff,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { timetableData, type TimetableEntry } from '../data/timetableData';
import type { TimetableQuery } from '../types/timetable';

interface TimetableDisplayProps {
  submittedQuery: TimetableQuery | null;
  onClearQuery: () => void;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function parseLocalDate(isoDate: string): Date | null {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function getLocalWeekday(isoDate: string): string {
  const dateObj = parseLocalDate(isoDate);
  if (!dateObj) {
    return '';
  }
  return WEEKDAYS[dateObj.getDay()];
}

function formatReadableDate(isoDate: string): string {
  const dateObj = parseLocalDate(isoDate);
  if (!dateObj) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

function formatTime12Hour(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time24;
  }
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function timeToMinutes(time24: string): number {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return 0;
  }
  return hour * 60 + minute;
}

export function TimetableDisplay({
  submittedQuery,
  onClearQuery,
}: TimetableDisplayProps) {
  let selectedWeekday = '';
  let hasSemesterData = false;
  let matchingClasses: TimetableEntry[] = [];

  if (submittedQuery) {
    selectedWeekday = getLocalWeekday(submittedQuery.date);
    hasSemesterData = timetableData.some(
      (entry) => entry.semester === submittedQuery.semester
    );

    if (hasSemesterData && selectedWeekday) {
      matchingClasses = timetableData
        .filter(
          (entry) =>
            entry.semester === submittedQuery.semester &&
            entry.day === selectedWeekday &&
            (entry.batch === 'Common' ||
              entry.batch === submittedQuery.batchLabel)
        )
        .sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
    }
  }

  return (
    <section
      id="timetable-section"
      aria-labelledby="timetable-heading"
      className="flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2
            id="timetable-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Daily Timetable
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {submittedQuery
              ? 'Schedule results for your selected class details'
              : 'Your daily class schedule will appear in this section'}
          </p>
        </div>

        {submittedQuery && (
          <button
            type="button"
            onClick={onClearQuery}
            className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Clear Result
          </button>
        )}
      </div>

      {!submittedQuery ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <CalendarDays className="h-6 w-6" aria-hidden="true" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            No search submitted yet
          </h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
            Choose your department, semester, batch or roll number, and date in the search panel, then select{' '}
            <span className="font-semibold text-slate-700">Find My Classes</span>.
          </p>

          <div className="mt-8 w-full max-w-md border-t border-slate-100 pt-6">
            <div className="grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xs font-medium text-slate-400">Step 1</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  Pick Semester
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Step 2</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  Identify Batch
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Step 3</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  Choose Date
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between pt-6">
          <div>
            {/* Selected Criteria Summary */}
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Selected Search Criteria
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 border-y border-slate-100 py-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Department</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                    {submittedQuery.departmentLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Semester</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                    {submittedQuery.semesterLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">
                    {submittedQuery.batchMode === 'rollNumber'
                      ? 'Identified Batch'
                      : 'Batch'}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                    {submittedQuery.batchLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Date</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums">
                    {formatReadableDate(submittedQuery.date)}
                  </dd>
                </div>

                {submittedQuery.rollNumber && (
                  <div>
                    <dt className="text-xs text-slate-500">Roll Number</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {submittedQuery.rollNumber}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Filtered Timetable Output */}
            {!hasSemesterData ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                  <CalendarClock className="h-6 w-6" aria-hidden="true" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Timetable Not Available Yet
                </h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
                  Timetable data for{' '}
                  <span className="font-semibold text-slate-700">
                    {submittedQuery.semesterLabel}
                  </span>{' '}
                  has not been added yet. Currently, only 3rd Semester CSE timetable entries are available.
                </p>
              </div>
            ) : matchingClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                  <CalendarOff className="h-6 w-6" aria-hidden="true" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No Classes Scheduled
                </h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
                  There are no classes scheduled for{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedWeekday}
                  </span>{' '}
                  in {submittedQuery.semesterLabel} ({submittedQuery.batchLabel}).
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Classes for {selectedWeekday}
                  </h3>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {matchingClasses.length}{' '}
                    {matchingClasses.length === 1 ? 'session' : 'sessions'} ·
                    Recess 12:00 PM – 1:30 PM
                  </span>
                </div>

                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {matchingClasses.map((entry, index) => (
                    <li
                      key={`${entry.day}-${entry.startTime}-${entry.batch}-${entry.subjectName}-${index}`}
                      className="py-4 first:pt-4 last:pb-2"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-blue-700 tabular-nums">
                              <Clock
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                {formatTime12Hour(entry.startTime)} –{' '}
                                {formatTime12Hour(entry.endTime)}
                              </span>
                            </span>

                            {entry.subjectCode.trim() !== '' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono font-medium text-slate-600">
                                  {entry.subjectCode}
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-slate-900 sm:text-base">
                            {entry.subjectName}
                          </p>

                          {(entry.faculty.trim() !== '' ||
                            entry.room.trim() !== '') && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-slate-600">
                              {entry.faculty.trim() !== '' && (
                                <span className="inline-flex items-center gap-1.5">
                                  <User
                                    className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                    aria-hidden="true"
                                  />
                                  <span>Faculty: {entry.faculty}</span>
                                </span>
                              )}

                              {entry.room.trim() !== '' && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin
                                    className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                    aria-hidden="true"
                                  />
                                  <span>Room: {entry.room}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 text-xs font-semibold text-slate-700 sm:pt-0.5">
                          {entry.batch}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
            <span>CSE Routine · {submittedQuery.semesterLabel}</span>
            <span className="tabular-nums">{submittedQuery.date}</span>
          </div>
        </div>
      )}
    </section>
  );
}
