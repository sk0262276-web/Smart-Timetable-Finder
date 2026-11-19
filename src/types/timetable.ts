export type DepartmentCode = 'CSE';

export type SemesterValue = '3' | '5' | '7';

export type BatchValue = 'Batch I' | 'Batch II';

export type BatchIdentificationMode = 'manual' | 'rollNumber';

export interface RollNumberRange {
  min: number;
  max: number;
}

export interface SemesterRollRanges {
  batchI: RollNumberRange;
  batchII: RollNumberRange;
}

export const OFFICIAL_ROLL_RANGES: Partial<
  Record<SemesterValue, SemesterRollRanges>
> = {
  '3': {
    batchI: { min: 11000125001, max: 11000125031 },
    batchII: { min: 11000125032, max: 11000125066 },
  },
  '5': {
    batchI: { min: 11000124001, max: 11000124031 },
    batchII: { min: 11000124032, max: 11000124075 },
  },
};

export interface BatchIdentificationResult {
  batch: BatchValue | null;
  error?: string;
}

export function supportsAutomaticBatch(semester: SemesterValue | ''): boolean {
  return semester === '3' || semester === '5';
}

export function identifyBatchFromRollNumber(
  semester: SemesterValue | '',
  rawRollNumber: string
): BatchIdentificationResult {
  const trimmed = rawRollNumber.trim();

  if (!trimmed) {
    return {
      batch: null,
      error: 'Please enter your college roll number.',
    };
  }

  if (!semester) {
    return {
      batch: null,
      error: 'Please select 3rd or 5th Semester first to verify your roll number.',
    };
  }

  if (semester === '7') {
    return {
      batch: null,
      error:
        'Automatic roll number lookup is not available for 7th Semester. Please select Batch I or Batch II manually.',
    };
  }

  if (!/^\d+$/.test(trimmed)) {
    return {
      batch: null,
      error: 'Invalid roll number format. Enter digits only (e.g., 11000125001).',
    };
  }

  const numericRoll = Number(trimmed);
  const ranges = OFFICIAL_ROLL_RANGES[semester];

  if (!ranges) {
    return {
      batch: null,
      error: 'Roll number ranges are not available for the selected semester.',
    };
  }

  if (numericRoll >= ranges.batchI.min && numericRoll <= ranges.batchI.max) {
    return { batch: 'Batch I' };
  }

  if (numericRoll >= ranges.batchII.min && numericRoll <= ranges.batchII.max) {
    return { batch: 'Batch II' };
  }

  // Check if the roll number matches the other supported semester to give a clearer error
  const otherSemester: SemesterValue = semester === '3' ? '5' : '3';
  const otherRanges = OFFICIAL_ROLL_RANGES[otherSemester];
  if (
    otherRanges &&
    numericRoll >= otherRanges.batchI.min &&
    numericRoll <= otherRanges.batchII.max
  ) {
    const selectedLabel = semester === '3' ? '3rd Semester' : '5th Semester';
    const otherLabel = otherSemester === '3' ? '3rd Semester' : '5th Semester';
    return {
      batch: null,
      error: `This roll number belongs to ${otherLabel}, not ${selectedLabel}. Valid ${selectedLabel} range: ${ranges.batchI.min} to ${ranges.batchII.max}.`,
    };
  }

  const semesterLabel = semester === '3' ? '3rd Semester' : '5th Semester';
  return {
    batch: null,
    error: `Roll number does not match the official ${semesterLabel} CSE range (${ranges.batchI.min} to ${ranges.batchII.max}).`,
  };
}

export interface TimetableFormState {
  department: DepartmentCode;
  semester: SemesterValue | '';
  batchMode: BatchIdentificationMode;
  manualBatch: BatchValue | '';
  rollNumber: string;
  date: string;
}

export interface TimetableQuery {
  department: DepartmentCode;
  departmentLabel: string;
  semester: SemesterValue;
  semesterLabel: string;
  batchMode: BatchIdentificationMode;
  batchLabel: BatchValue;
  rollNumber?: string;
  date: string;
}

export interface FormValidationErrors {
  semester?: string;
  batch?: string;
  date?: string;
}

export const DEPARTMENTS: ReadonlyArray<{ code: DepartmentCode; label: string }> = [
  {
    code: 'CSE',
    label: 'Computer Science and Engineering (CSE)',
  },
];

export const SEMESTERS: ReadonlyArray<{ value: SemesterValue; label: string }> = [
  { value: '3', label: '3rd Semester' },
  { value: '5', label: '5th Semester' },
  { value: '7', label: '7th Semester' },
];

export const BATCHES: ReadonlyArray<BatchValue> = ['Batch I', 'Batch II'];
