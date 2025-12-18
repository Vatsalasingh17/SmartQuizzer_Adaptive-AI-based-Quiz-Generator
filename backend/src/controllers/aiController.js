const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/v1/ai/generate-quiz
 */
const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;

    if (!topic || !difficulty || !numQuestions) {
      return res.status(400).json({
        error: "Missing required fields: topic, difficulty, numQuestions"
      });
    }

    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "question text here",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "why this is correct",
    "subtopic": "specific area within ${topic}"
  }
]

Ensure correctAnswer is the index (0-3) of the correct option.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: "system", content: "You generate clean JSON only." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      text: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI quiz generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate quiz"
    });
  }
};

/**
 * POST /api/v1/ai/generate-feedback
 */
const generateFeedback = async (req, res) => {
  try {
    const { topic, difficulty, correct, total, wrongSubtopics } = req.body;

    // Make `topic` optional for feedback generation and provide a sensible default
    if (!difficulty || correct == null || total == null) {
      return res.status(400).json({
        error: "Missing required feedback fields: difficulty, correct, total"
      });
    }

    const effectiveTopic = topic && topic.trim() ? topic.trim() : 'this quiz';

    const feedbackPrompt = `Analyze performance on "${effectiveTopic}":

Results: ${correct}/${total}
Difficulty: ${difficulty}

Wrong subtopics:
${(wrongSubtopics || []).map(s => `- ${s}`).join("\n")}

Provide concise, motivating feedback with:
1. Overall performance
2. Strengths
3. Weak areas
4. 3 concrete study recommendations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 500,
      messages: [{ role: "user", content: feedbackPrompt }]
    });

    res.json({
      text: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI feedback generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate feedback"
    });
  }
};

/**
 * POST /api/v1/ai/generate-quiz-from-content
 * Expects: { fileData: { type: 'text'|'pdf', content: string }, difficulty, numQuestions, sourceName }
 */
const generateQuizFromContent = async (req, res) => {
  try {
    const { fileData, difficulty, numQuestions, sourceName } = req.body;

    if (!fileData || !difficulty || !numQuestions) {
      return res.status(400).json({
        error: 'Missing required fields: fileData (with content), difficulty, numQuestions'
      });
    }

    if (fileData.type === 'pdf') {
      // PDF handling is not implemented server-side (requires text extraction).
      return res.status(400).json({
        error: 'PDF uploads are not currently supported server-side. Please paste text content instead.'
      });
    }

    if (!fileData.content || typeof fileData.content !== 'string' || fileData.content.trim().length < 20) {
      return res.status(400).json({
        error: 'Invalid fileData.content: please provide at least ~20 chars of text content.'
      });
    }

    const prompt = `Based on the following content (source: ${sourceName || 'user-provided text'}), generate exactly ${numQuestions} multiple choice questions at ${difficulty} difficulty level.\n\nCONTENT:\n${fileData.content}\n\nReturn ONLY a valid JSON array with this exact structure, no other text:\n[\n  {\n    "question": "question text here",\n    "options": ["option1", "option2", "option3", "option4"],\n    "correctAnswer": 0,\n    "explanation": "why this is correct",\n    "subtopic": "specific area from the content"\n  }\n]\n\nMake questions that test understanding of the content. Ensure correctAnswer is the index (0-3) of the correct option.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You must return only valid JSON and nothing else.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI content-based quiz generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz from content' });
  }
};

module.exports = {
  generateQuiz,
  generateFeedback,
  generateQuizFromContent
};
