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
  sourceWorkoutId: string;
}

export interface ScreenMapping {
  screen: Screen;
  splitScreen: boolean;
  exercise1: Exercise;
  exercise2: Exercise;
}

export interface Exercise extends Dto {
  name: string;
  videoUrl: string;
}

export interface Dto {
  id: string;
}
