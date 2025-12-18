
import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { generateFeedback } from '../services/aiService';
import { calculatePercentage } from '../utils/helpers';
import { SCREEN_TYPES } from '../utils/constants';

export default function QuizScreen({ 
  questions, 
  currentQuestion, 
  setCurrentQuestion, 
  answers, 
  setAnswers, 
  quizConfig, 
  setResults, 
  setCurrentScreen, 
  loading, 
  setLoading 
}) {
  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswer = (selectedIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedIndex;
    setAnswers(newAnswers);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitQuiz = async () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => a === undefined || a === null).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    
    try {
      let correct = 0;
      const detailedResults = questions.map((q, i) => {
        const isCorrect = answers[i] === q.correctAnswer;
        if (isCorrect) correct++;
        return {
          question: q.question,
          userAnswer: answers[i],
          correctAnswer: q.correctAnswer,
          isCorrect,
          subtopic: q.subtopic,
          explanation: q.explanation
        };
      });

      const wrongSubtopics = detailedResults
        .filter(r => !r.isCorrect)
        .map(r => r.subtopic);

      const feedback = await generateFeedback(
        quizConfig.topic,
        quizConfig.difficulty,
        correct,
        questions.length,
        wrongSubtopics
      );

      setResults({
        score: correct,
        total: questions.length,
        percentage: calculatePercentage(correct, questions.length),
        details: detailedResults,
        feedback
      });
      
      setCurrentScreen(SCREEN_TYPES.RESULTS);
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Could not generate detailed feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="card-lift motion-fade-up">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm font-medium text-indigo-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {answers.filter(a => a !== undefined && a !== null).length} answered
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 font-medium">{quizConfig.topic}</div>
                <div className="text-xs text-gray-500 capitalize">{quizConfig.difficulty}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, transition: 'width 750ms ease' }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-relaxed">
              {q.question}
            </h3>
            {q.subtopic && (
              <p className="text-sm text-gray-500">
                📌 Subtopic: {q.subtopic}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {q.options.map((option, idx) => {
              const isSelected = answers[currentQuestion] === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 motion-pop ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {optionLetter}
                    </div>
                    <span className={`flex-1 ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            {!isLastQuestion ? (
              <button
                onClick={goToNext}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                Next Question
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing Results...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Quiz
                  </>
                )}
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 font-medium">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
                const isCurrent = idx === currentQuestion;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}