export interface ActiveProgramme extends Programme {
  currentActiveTime: number;
  currentRestTime: number;
}

export interface Screen extends Dto {
  tag: string;
  deviceId: string;
}

export interface Programme extends Dto {
  name: string;
  activeTime: number;
  restTime: number;
  mappings: ScreenMapping[];
  message: string;
  sourceWorkoutId: string;
  lastUpdated: Date;
}

export interface ScreenMapping {
  screen: Screen;
  splitScreen: boolean;
  exercise1: Exercise | null;
  exercise2: Exercise | null;
  showTimer: boolean;
  screenTitle1: string | null;
  screenTitle2: string | null;
}

export interface Exercise extends Dto {
  name: string;
  title: string;
  videoUrl: string;
  videoFileName: string;
  category: string;
}

export interface Dto {
  id: string;
}

export interface ExerciseResult {
  results: Exercise[];
  count: number;
}
