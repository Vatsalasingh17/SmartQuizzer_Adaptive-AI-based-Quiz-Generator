import React, { useState, useEffect } from 'react';
import { Trophy, Brain, FileText, Download, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { generatePDFContent, downloadPDF } from '../services/pdfGenerator';
import { SCREEN_TYPES } from '../utils/constants';
import { getGradeFromPercentage } from '../utils/helpers';


export default function ResultsScreen({ 
  user, 
  quizConfig, 
  results, 
  questions, 
  setCurrentScreen, 
  resetQuiz 
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const timers = { toast: null, copy: null };

  useEffect(() => {
    return () => {
      if (timers.toast) clearTimeout(timers.toast);
      if (timers.copy) clearTimeout(timers.copy);
    };
  }, []);

  const handleCopyFeedback = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API not available');
      await navigator.clipboard.writeText(results.feedback);
      setCopied(true);
      setToastMessage('Feedback copied to clipboard');
      setShowToast(true);

      // Hide toast after 2s, reset copied after 1.4s
      timers.toast = setTimeout(() => setShowToast(false), 2000);
      timers.copy = setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      setToastMessage('Failed to copy feedback');
      setShowToast(true);
      timers.toast = setTimeout(() => setShowToast(false), 2200);
      console.error('Copy failed', err);
    }
  };

  // Extract simple key suggestions from feedback (heuristic)
  const extractKeySuggestions = (text) => {
    if (!text || !text.trim()) return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const listLines = lines.filter(l => /^\d+\.|^\-|^\u2022|^\*/.test(l) || /recommend/i.test(l));
    if (listLines.length >= 1) return listLines.slice(0, 4).map(l => l.replace(/^\d+\.|^\-|^\u2022|^\*/,'').trim());

    const sentences = text.split(/(?<=[\.\!\?])\s+/).map(s => s.trim()).filter(Boolean);
    const good = sentences.filter(s => s.length > 30).slice(0,3);
    if (good.length) return good;

    return lines.slice(0,2);
  };

  const suggestions = extractKeySuggestions(results.feedback);

  const { grade, color } = getGradeFromPercentage(results.percentage);

  const handleDownload = () => {
    const content = generatePDFContent(user, quizConfig, results, questions);
    const timestamp = new Date().getTime();
    downloadPDF(content, `quiz_results_${user.name}_${timestamp}.txt`);
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setCurrentScreen(SCREEN_TYPES.CONFIG);
  };

  // Calculate statistics
  const correctCount = results.details.filter(r => r.isCorrect).length;
  const incorrectCount = results.details.filter(r => !r.isCorrect).length;
  const unansweredCount = results.details.filter(r => r.userAnswer === undefined || r.userAnswer === null).length;

  // Get weak topics
  const weakTopics = {};
  results.details.forEach(r => {
    if (!r.isCorrect) {
      weakTopics[r.subtopic] = (weakTopics[r.subtopic] || 0) + 1;
    }
  });

  const sortedWeakTopics = Object.entries(weakTopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Score Card */}
        <div className="card-lift motion-fade-up text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete! 🎉</h2>
          
          <div className="my-6">
            <div className={`text-7xl font-bold mb-2 text-${color}-600`}>
              {results.percentage}%
            </div>
            <div className={`inline-block px-4 py-2 rounded-full bg-${color}-100 text-${color}-700 font-bold text-xl mb-4`}>
              Grade: {grade}
            </div>
            <p className="text-xl text-gray-600">
              {results.score} out of {results.total} correct
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-xs text-gray-600">Incorrect</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{unansweredCount}</div>
              <div className="text-xs text-gray-600">Unanswered</div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button 
              onClick={handleDownload} 
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button 
              onClick={handleNewQuiz} 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              New Quiz
            </button>
          </div>
        </div>

        {/* Weak Areas (if any) */}
        {sortedWeakTopics.length > 0 && (
          <div className="card-lift motion-fade-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-orange-600" />
              Areas to Focus On
            </h3>
            <div className="space-y-3">
              {sortedWeakTopics.map(([topic, count], idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{topic}</div>
                    <div className="text-sm text-gray-600">{count} question(s) incorrect</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        <div className="card-lift motion-fade-up relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full analysis-accent pointer-events-none" />

          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">AI Performance Analysis</h3>
              <p className="text-xs text-gray-500 mt-1">Personalized insights and focused study recommendations to help you improve.</p>
            </div>
          </div>

            <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed bg-gradient-to-br from-white to-indigo-50 p-4 rounded-lg border border-indigo-50 shadow-sm motion-fade-in">
            {results.feedback}
          </div>

          {/* Key suggestions chips */}
          {suggestions && suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Suggestions</h4>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="suggestion-chip">{s}</div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-3 justify-end items-center">
            <button
              onClick={handleCopyFeedback}
              className="btn-ghost text-sm flex items-center gap-2"
              id="copy-feedback-btn"
            >
              <svg className={`tick-icon ${copied ? 'show' : ''}`} viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="1.6" opacity="0.2" />
                <path d="M7.5 12.3l2.4 2.4L16.5 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copied ? 'Copied' : 'Copy Feedback'}
            </button>

            <button
              onClick={handleDownload}
              className="btn-primary text-sm"
            >
              Download
            </button>
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="card-lift motion-fade-up">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Detailed Review
          </h3>
          <div className="space-y-6">
            {results.details.map((result, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all ${
                  result.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                    result.isCorrect 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-bold text-gray-800 text-lg">
                        Q{idx + 1}. {result.question}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        📌 {result.subtopic}
                      </span>
                    </div>

                    {!result.isCorrect && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-red-700">Your answer:</span>
                          <span className="text-sm text-red-600">
                            {result.userAnswer !== undefined && result.userAnswer !== null
                              ? `${String.fromCharCode(65 + result.userAnswer)}. ${questions[idx].options[result.userAnswer]}`
                              : 'Not answered'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-700">Correct answer:</span>
                          <span className="text-sm text-green-600 font-medium">
                            {String.fromCharCode(65 + result.correctAnswer)}. {questions[idx].options[result.correctAnswer]}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">💡 Explanation:</span> {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <button 
            onClick={handleNewQuiz}
            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Take Another Quiz
          </button>
        </div>
      </div>

      {/* Non-blocking toast */}
      <div className={`toast ${showToast ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
}

