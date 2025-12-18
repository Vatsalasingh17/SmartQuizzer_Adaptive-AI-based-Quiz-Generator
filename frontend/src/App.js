import React from 'react';
import { useQuizState } from './hooks/useQuizState';
import { LoginScreen, QuizConfig, QuizScreen, ResultsScreen } from './components';
import { SCREEN_TYPES } from './utils/constants';

export default function App() {
  const quizState = useQuizState();

  const renderScreen = () => {
    switch (quizState.currentScreen) {
      case SCREEN_TYPES.LOGIN:
        return <LoginScreen {...quizState} />;
      case SCREEN_TYPES.CONFIG:
        return <QuizConfig {...quizState} />;
      case SCREEN_TYPES.QUIZ:
        return <QuizScreen {...quizState} />;
      case SCREEN_TYPES.RESULTS:
        return <ResultsScreen {...quizState} />;
      default:
        return <LoginScreen {...quizState} />;
    }
  };

  return <div className="min-h-screen">{renderScreen()}</div>;
}