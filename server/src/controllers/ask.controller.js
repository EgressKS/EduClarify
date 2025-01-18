import { askQuestion } from '../services/ask.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const askController = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const result = await askQuestion(question);
  res.status(200).json(result);
});

