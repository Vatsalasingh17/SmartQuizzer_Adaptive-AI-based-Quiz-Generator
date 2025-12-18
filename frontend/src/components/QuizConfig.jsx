import React, { useState } from 'react';
import { BookOpen, LogOut, Sparkles, Upload, FileText, Type, X } from 'lucide-react';
import { generateQuizQuestions, generateQuizFromContent } from '../services/aiService';
import { SCREEN_TYPES, QUESTION_COUNTS } from '../utils/constants';

export default function QuizConfig({ 
  user, 
  quizConfig, 
  setQuizConfig, 
  setQuestions, 
  setCurrentScreen, 
  setUser, 
  loading, 
  setLoading 
}) {
  const [quizMode, setQuizMode] = useState('topic'); // 'topic', 'document', 'text'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [processingFile, setProcessingFile] = useState(false);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, TXT, or Word document');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setQuizConfig({...quizConfig, topic: file.name.split('.')[0]});
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setQuizConfig({...quizConfig, topic: ''});
  };

  // Read file content
  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (file.type === 'application/pdf') {
          // For PDF, we'll send as base64
          const base64 = e.target.result.split(',')[1];
          resolve({ type: 'pdf', content: base64 });
        } else {
          // For text files
          resolve({ type: 'text', content: e.target.result });
        }
      };
      
      reader.onerror = reject;
      
      if (file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Generate quiz from uploaded document
  const generateFromDocument = async () => {
    if (!uploadedFile) {
      alert('Please upload a document first');
      return;
    }

    setLoading(true);
    setProcessingFile(true);

    try {
      const fileData = await readFileContent(uploadedFile);
      
      const questions = await generateQuizFromContent(
        fileData,
        quizConfig.difficulty,
        quizConfig.numQuestions,
        uploadedFile.name
      );
      
      setQuestions(questions);
      setCurrentScreen(SCREEN_TYPES.QUIZ);
    } catch (error) {
      console.error('Error generating quiz from document:', error);
      alert('Failed to generate quiz from document. Please try again.');
    } finally {
      setLoading(false);
      setProcessingFile(false);
    }
  };

  // Generate quiz from pasted text
  const generateFromText = async () => {
    if (!pastedText.trim()) {
      alert('Please paste some text first');
      return;
    }

    if (pastedText.length < 100) {
      alert('Please provide at least 100 characters of text for better quiz generation');
      return;
    }

    setLoading(true);

    try {
      const questions = await generateQuizFromContent(
        { type: 'text', content: pastedText },
        quizConfig.difficulty,
        quizConfig.numQuestions,
        'Pasted Content'
      );
      
      setQuestions(questions);
      setCurrentScreen(SCREEN_TYPES.QUIZ);
    } catch (error) {
      console.error('Error generating quiz from text:', error);
      alert('Failed to generate quiz from text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz from topic (original method)
  const generateFromTopic = async () => {
    if (!quizConfig.topic.trim()) {
      alert('Please enter a quiz topic');
      return;
    }
    
    setLoading(true);
    try {
      const questions = await generateQuizQuestions(
        quizConfig.topic,
        quizConfig.difficulty,
        quizConfig.numQuestions
      );
      setQuestions(questions);
      setCurrentScreen(SCREEN_TYPES.QUIZ);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please check your API key and try again.');
    }
    setLoading(false);
  };

  const handleGenerate = () => {
    switch (quizMode) {
      case 'document':
        generateFromDocument();
        break;
      case 'text':
        generateFromText();
        break;
      default:
        generateFromTopic();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen(SCREEN_TYPES.LOGIN);
  };

  const canGenerate = () => {
    if (loading) return false;
    switch (quizMode) {
      case 'document':
        return uploadedFile !== null;
      case 'text':
        return pastedText.trim().length >= 100;
      default:
        return quizConfig.topic.trim().length > 0;
    }
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}! 👋</h2>
              <p className="text-gray-600 text-sm mt-1">Configure your personalized quiz</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Quiz Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Quiz Source
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setQuizMode('topic')}
                className={`p-4 rounded-xl border-2 transition ${
                  quizMode === 'topic'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <BookOpen className={`w-6 h-6 mx-auto mb-2 ${
                  quizMode === 'topic' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold">Topic</div>
                <div className="text-xs text-gray-500 mt-1">Enter a subject</div>
              </button>

              <button
                onClick={() => setQuizMode('document')}
                className={`p-4 rounded-xl border-2 transition ${
                  quizMode === 'document'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <Upload className={`w-6 h-6 mx-auto mb-2 ${
                  quizMode === 'document' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold">Document</div>
                <div className="text-xs text-gray-500 mt-1">Upload file</div>
              </button>

              <button
                onClick={() => setQuizMode('text')}
                className={`p-4 rounded-xl border-2 transition ${
                  quizMode === 'text'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <Type className={`w-6 h-6 mx-auto mb-2 ${
                  quizMode === 'text' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold">Text</div>
                <div className="text-xs text-gray-500 mt-1">Paste content</div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Topic Mode */}
            {quizMode === 'topic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="inline w-4 h-4 mr-2" />
                  Quiz Topic
                </label>
                <input
                  type="text"
                  value={quizConfig.topic}
                  onChange={(e) => setQuizConfig({...quizConfig, topic: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Python Programming, World History, Biology"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Be specific for better questions (e.g., "React Hooks" instead of "React")
                </p>
              </div>
            )}

            {/* Document Upload Mode */}
            {quizMode === 'document' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-2" />
                  Upload Document
                </label>
                
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PDF, TXT, DOC, DOCX (Max 10MB)
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-10 h-10 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {processingFile && (
                  <div className="mt-3 text-sm text-indigo-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    Processing document...
                  </div>
                )}
              </div>
            )}

            {/* Text Paste Mode */}
            {quizMode === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type className="inline w-4 h-4 mr-2" />
                  Paste Text Content
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  rows="10"
                  placeholder="Paste your text content here... (minimum 100 characters)

Example: 
The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {pastedText.length} characters (minimum 100 required)
                  </p>
                  {pastedText.length >= 100 && (
                    <span className="text-xs text-green-600 font-semibold">✓ Ready</span>
                  )}
                </div>
              </div>
            )}

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'easy', emoji: '😊', desc: 'Beginner' },
                  { level: 'medium', emoji: '🧠', desc: 'Intermediate' },
                  { level: 'hard', emoji: '🔥', desc: 'Advanced' }
                ].map(({ level, emoji, desc }) => (
                  <button
                    key={level}
                    onClick={() => setQuizConfig({...quizConfig, difficulty: level})}
                    className={`py-4 rounded-lg font-semibold transition transform hover:scale-105 ${
                      quizConfig.difficulty === level
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-sm">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                    <div className="text-xs opacity-75 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={quizConfig.numQuestions}
                onChange={(e) => setQuizConfig({...quizConfig, numQuestions: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
              >
                {QUESTION_COUNTS.map(count => (
                  <option key={count} value={count}>
                    {count} Questions {count === 10 ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate()}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {processingFile ? 'Processing Document...' : 'Generating Quiz...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Quiz
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              🤖© 2025 Vatsala Singh. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}