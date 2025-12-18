import { useState } from 'react';
import { SCREEN_TYPES } from '../utils/constants';

export const useQuizState = () => {
  const [currentScreen, setCurrentScreen] = useState(SCREEN_TYPES.LOGIN);

  // ✅ ADD THESE TWO LINES
  const [loginName, setLoginName] = useState('');

  const [user, setUser] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const resetQuiz = () => {
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setCurrentQuestion(0);
  };

  return {
    currentScreen,
    setCurrentScreen,

    // ✅ RETURN THEM HERE
    loginName,
    setLoginName,

    user,
    setUser,
    quizConfig,
    setQuizConfig,
    questions,
    setQuestions,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    loading,
    setLoading,
    results,
    setResults,
    resetQuiz
  };
};
