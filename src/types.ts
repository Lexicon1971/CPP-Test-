import { Timestamp } from 'firebase/firestore';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  falseIndex: number; 
  explanation: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  gradeTaught: string;
  intendToTeach: boolean;
  lastTestDate?: Timestamp;
  testAttempts: TestResult[];
  isAdmin: boolean;
}

export interface TestResult {
  date: string;
  score: number;
  passed: boolean;
  questionDetails: QuestionAttempt[];
}

export interface QuestionAttempt {
  questionId: number;
  attempts: number;
  isCorrect: boolean;
}

export type AppState = 'AUTH' | 'DASHBOARD' | 'QUIZ' | 'RESULT' | 'ADMIN';