export const API_CONFIG = {
  apiUrl: process.env.REACT_APP_PROXY_BASE_URL || 'https://api.anthropic.com/v1/messages',
  model: process.env.REACT_APP_MODEL || 'claude-sonnet-4-20250514',
  maxTokens: 4000
};

export const QUIZ_CONFIG = {
  minQuestions: 5,
  maxQuestions: 20,
  difficulties: ['easy', 'medium', 'hard'],
  defaultDifficulty: 'medium'
};
