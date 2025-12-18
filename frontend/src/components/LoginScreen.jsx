import React, { useState, useEffect } from 'react';
import { Brain, LogIn } from 'lucide-react';
import { SCREEN_TYPES } from '../utils/constants';

export default function LoginScreen({ setUser, setCurrentScreen }) {
  const [loginName, setLoginName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleLogin = () => {
    if (!loginName.trim()) return;
    if (!email.trim() || !isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    // Small delay to allow UI animation to show
    setTimeout(() => {
      setUser({ name: loginName, email });
      setCurrentScreen(SCREEN_TYPES.CONFIG);
      setIsSubmitting(false);
    }, 350);
  };

  useEffect(() => {
    const el = document.getElementById('login-card');
    if (el) el.classList.add('stagger-play');
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden  flex items-center justify-center p-6">
      {/* Animated gradient descent background layer */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-descent" />

      {/* Subtle decorative shapes */}
      <div className="pointer-events-none absolute -left-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-200 to-indigo-400 opacity-30 blur-3xl transform rotate-45 animate-pulse" />
      <div className="pointer-events-none absolute -right-36 -bottom-36 w-72 h-72 rounded-full bg-gradient-to-r from-blue-200 to-cyan-300 opacity-25 blur-3xl transform rotate-12" />

      <div className="relative w-full max-w-md">
        <div id="login-card" className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30 transition-transform transform hover:scale-102 motion-fade-up stagger">          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg text-white transform transition-transform hover:scale-110">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Smart AI Quiz Generator</h1>
              <p className="text-sm text-gray-500 mt-1">Personalized quizzes and motivating feedback — powered by AI ✨</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm hover:shadow-md"
                placeholder="e.g., Alex"
                autoFocus
                aria-label="Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 outline-none transition shadow-sm hover:shadow-md border ${email && !isValidEmail(email) ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="you@example.com"
                aria-label="Email"
              />
              <p className="text-xs mt-1 ${email && !isValidEmail(email) ? 'text-red-500' : 'text-gray-400'}">We will use this to send learning tips (no spam).</p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleLogin}
                disabled={!loginName.trim() || !email.trim() || !isValidEmail(email) || isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transform transition duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Getting started...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Start Learning
                  </>
                )}
              </button>

              <button
                onClick={() => { setUser({ name: 'Guest' }); setCurrentScreen(SCREEN_TYPES.CONFIG); }}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:shadow-md transition"
              >
                Continue as Guest
              </button>
            </div>

            <div className="text-center text-xs text-gray-400 mt-3">By continuing you agree to our <button className="underline">Terms</button> and <button className="underline">Privacy</button>.</div>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-gray-500">Made with ❤️ for learners • Built with AI</div>
      </div>
    </div>
  );
}