import { cleanJsonResponse } from '../utils/helpers';
import { API_CONFIG } from '../config';

// Proxy base URL
const PROXY_BASE_URL = 'http://localhost:5000/api/v1/ai';

/**
 * Generate quiz questions via OpenAI (through proxy)
 */
export const generateQuizQuestions = async (topic, difficulty, numQuestions) => {
  const PROXY_ENDPOINT = `${PROXY_BASE_URL}/generate-quiz`;

  const payload = {
    topic,
    difficulty,
    numQuestions
  };

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown Proxy Error'
      }));
      throw new Error(errorData.error || 'Quiz generation failed');
    }

    const data = await response.json();

    /**
     * Expected proxy response shape:
     * { text: "LLM output here" }
     */
    const cleanJson = cleanJsonResponse(data.text);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error('Error generating quiz via OpenAI proxy:', error);
    throw error;
  }
};

/**
 * Generate quiz feedback via OpenAI (through proxy)
 */
export const generateFeedback = async (
  topic,
  difficulty,
  correct,
  total,
  wrongSubtopics
) => {
  const PROXY_ENDPOINT = `${PROXY_BASE_URL}/generate-feedback`;

  const payload = {
    topic,
    difficulty,
    correct,
    total,
    wrongSubtopics
  };

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown Proxy Error'
      }));
      throw new Error(errorData.error || 'Feedback generation failed');
    }

    const data = await response.json();

    /**
     * Expected proxy response shape:
     * { text: "feedback text here" }
     */
    return data.text;

  } catch (error) {
    console.error('Error generating feedback via OpenAI proxy:', error);
    throw error;
  }
};

export const generateQuizFromContent = async (fileData, difficulty, numQuestions, sourceName) => {
  const PROXY_ENDPOINT = `${PROXY_BASE_URL}/generate-quiz-from-content`;

  const payload = {
    fileData,
    difficulty,
    numQuestions,
    sourceName
  };

  try {
    // Debug: show payload
    console.debug('Proxy request payload (content):', { sourceName, type: fileData.type, length: (fileData.content || '').length });

    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown Proxy Error' }));
      const primary = (errorData && (errorData.error || errorData.message)) ? (errorData.error || errorData.message) : errorData;
      const errMsg = typeof primary === 'string' ? primary : JSON.stringify(primary);
      throw new Error(`Proxy Request Failed (${response.status}): ${errMsg || response.statusText}`);
    }

    const data = await response.json();
    const content = data.text;
    const cleanJson = cleanJsonResponse(content);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error('Error generating quiz from content via proxy:', error.message || error, error);
    throw error;
  }
};
