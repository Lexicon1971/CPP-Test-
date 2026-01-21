import React, { useState, useEffect, useMemo } from 'react';
import { Question, QuestionAttempt, TestResult } from '../types';
import { QUESTION_POOL, COLORS } from '../constants';

interface QuizProps {
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, onCancel }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<QuestionAttempt[]>([]);
  const [testFinished, setTestFinished] = useState(false);

  useEffect(() => {
    const pool = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setShuffledQuestions(pool.slice(0, 20));
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (showExplanation || testFinished) return;
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        attempts: currentAttempts + 1,
        isCorrect: true
      };
      setAttemptsHistory(prev => [...prev, attempt]);
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    } else {
      if (currentAttempts === 0) {
        setCurrentAttempts(1);
        setTimeout(() => setSelectedOption(null), 1000);
      } else {
        const attempt: QuestionAttempt = {
          questionId: currentQuestion.id,
          attempts: 2,
          isCorrect: false
        };
        setAttemptsHistory(prev => [...prev, attempt]);
        setShowExplanation(true);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentAttempts(0);
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setTestFinished(true);
    const score = attemptsHistory.filter(a => a.isCorrect).length * 5;
    const result: TestResult = {
      date: new Date().toISOString(),
      score,
      passed: score >= 80,
      questionDetails: attemptsHistory
    };
    onComplete(result);
  };

  if (shuffledQuestions.length === 0) return <div>Loading...</div>;

  const progress = ((currentIndex + (testFinished ? 1 : 0)) / shuffledQuestions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
        <div className="h-full bg-[#2E5D4E] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Question {currentIndex + 1} of 20
        </span>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-red-500">
          Exit Quiz
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
        {currentQuestion.text}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {currentQuestion.options.map((option, idx) => {
          let stateClass = "border-gray-200 hover:border-[#2E5D4E] hover:bg-green-50";
          if (selectedOption === idx) {
            stateClass = idx === currentQuestion.correctIndex 
              ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500" 
              : "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500";
          }
          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={showExplanation}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${stateClass}`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${selectedOption === idx ? 'bg-white shadow-sm' : 'border-gray-300'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-medium text-lg">{option}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 p-6 bg-[#2E5D4E] bg-opacity-5 rounded-2xl border-2 border-[#2E5D4E]">
          <div className="flex items-start gap-4">
             <div className="bg-[#2E5D4E] text-white p-2 rounded-lg mt-1">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
             </div>
             <div>
               <h4 className="font-bold text-[#2E5D4E] text-lg mb-1">Let's learn why:</h4>
               <p className="text-gray-700 mb-4">{currentQuestion.explanation}</p>
               <button onClick={handleNextQuestion} className="bg-[#2E5D4E] text-white px-6 py-2 rounded-lg font-bold">
                 Continue
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};