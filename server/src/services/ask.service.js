import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

import { ENV } from '../config/env.js';

const SYSTEM_PROMPT = `You are an expert teacher and educational assistant. Your role is to help students understand complex concepts by providing clear, step-by-step explanations.

When responding to student questions, always format your response in exactly FOUR fields:

1. "avatar_script": A friendly, conversational introduction that the AI avatar will speak first (keep this under 50 words, natural and engaging)
2. "avatar_steps": An array of 3-6 conversational steps for the avatar to speak one at a time, breaking down the answer step-by-step in a human, interactive way. Each step should be:
   - A complete sentence that makes sense when spoken aloud
   - Conversational and engaging (like a real teacher explaining)
   - Under 25 words each for natural speech flow
   - Cover the complete explanation from start to finish
   - Use phrases like "Now, let me show you..." or "Here's what happens..." or "Let's break this down..."
3. "text_explanation": A detailed, step-by-step explanation with proper formatting
4. "image_query": 3-5 concise search keywords optimized for Wikimedia Commons to fetch a relevant diagram for the topic. Use specific, technical terms that Wikimedia Commons would have (e.g., "quadratic equation", "human heart anatomy", "photosynthesis process", "newton laws physics", "mitochondria structure"). Avoid generic words like "diagram", "image", "picture". Use only the most relevant scientific/technical terms.

For the text_explanation section:
- Use clear headings and bullet points
- For mathematical expressions, use LaTeX formatting:
  - Inline math: \\( ... \\) (e.g., \\(E = mc^2\\))
  - Block math: \\[ ... \\] (e.g., \\[\\int_0^\\infty e^{-x} dx = 1\\])
- Use markdown formatting for structure
- Break down complex concepts into simple steps
- Include examples where helpful
- Be encouraging and supportive

Respond ONLY with a valid JSON object, no code block markers, no markdown, no explanations, and no extra text. Do not include any text before or after the JSON object. Do not use triple backticks or the word 'json'.`;

const stopWords = new Set([
  'what', 'is', 'are', 'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'on',
  'about', 'explain', 'definition', 'define', 'tell', 'me', 'do', 'we', 'by',
  'with', 'how', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
  'their', 'from', 'when', 'where', 'why', 'which', 'who', 'whose', 'can',
  'could', 'will', 'would', 'should', 'may', 'might', 'must', 'shall', 'let',
  'get', 'got', 'have', 'has', 'had',
]);

let genAI;
if (ENV.geminiApiKey) {
  genAI = new GoogleGenerativeAI(ENV.geminiApiKey);
}

export function buildFallbackImageQuery(question, explanation = '') {
  const source = `${question} ${explanation}`.toLowerCase();
  const cleaned = source
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 4);

  if (words.length < 2) {
    words.push('diagram', 'illustration');
  }

  return words.join(' ');
}

async function generateWithRetry(model, prompt, maxAttempts = 3) {
  let attempt = 0;
  let lastErr;

  while (attempt < maxAttempts) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      const message = String(err?.message || '');
      const status = err?.status || err?.response?.status;
      const retriable =
        status === 429 ||
        (status && status >= 500) ||
        message.includes('overloaded') ||
        message.includes('temporarily unavailable') ||
        message.includes('quota') ||
        message.includes('rate');

      attempt += 1;
      if (!retriable || attempt >= maxAttempts) {
        throw lastErr;
      }

      const backoffMs = Math.min(2000 * attempt, 6000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastErr;
}

export async function askQuestion(question) {
  if (!question || typeof question !== 'string') {
    const error = new Error('Question is required and must be a string');
    error.status = 400;
    throw error;
  }

  if (!ENV.geminiApiKey || !genAI) {
    const error = new Error('Gemini API key is not configured');
    error.status = 500;
    throw error;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `${SYSTEM_PROMPT}

Student Question: "${question}"

Please provide your response in the exact JSON format specified above.`;

  const result = await generateWithRetry(model, prompt, 3);
  const response = await result.response;
  const text = response.text();

  let parsedResponse;
  try {
    let cleanText = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '').trim();
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch {
      parsedResponse = JSON.parse(jsonrepair(cleanText));
    }
  } catch {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch {
          parsedResponse = JSON.parse(jsonrepair(jsonMatch[0]));
        }
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (err) {
      const lines = text.split('\n').filter((line) => line.trim());
      const avatarScript =
        lines[0] || 'Let me explain this concept to you step by step.';
      const textExplanation = lines.slice(1).join('\n') || text;
      parsedResponse = {
        avatar_script: avatarScript,
        avatar_steps: [avatarScript],
        text_explanation: textExplanation,
        image_query: buildFallbackImageQuery(question, textExplanation),
      };
    }
  }

  if (!parsedResponse.avatar_script || !parsedResponse.text_explanation) {
    const error = new Error('Invalid response structure from Gemini');
    error.status = 502;
    throw error;
  }

  if (
    !parsedResponse.image_query ||
    typeof parsedResponse.image_query !== 'string' ||
    parsedResponse.image_query.length < 2
  ) {
    parsedResponse.image_query = buildFallbackImageQuery(
      question,
      parsedResponse.text_explanation,
    );
  }

  return parsedResponse;
}

