export type Subject = 'physics' | 'math' | 'chemistry';

export type Weightage = 'low' | 'med' | 'high';

export interface Chapter {
  id: string;
  name: string;
  weightage: Weightage;
  progress: [boolean, boolean, boolean]; // Theory, Practice, PYQs (or custom)
  todaysTasks: [boolean, boolean, boolean]; // Selection for "Today's Tasks"
}

export interface AppState {
  physics: Chapter[];
  math: Chapter[];
  chemistry: Chapter[];
}

export interface ColumnNames {
  col1: string;
  col2: string;
  col3: string;
}

export type SubjectColumnNames = Record<Subject, ColumnNames>;

export interface FilterState {
  search: string;
  weightage: Weightage | 'all';
  status: 'all' | 'not-started' | 'in-progress' | 'completed';
}
