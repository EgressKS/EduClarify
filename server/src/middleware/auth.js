import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserService } from '../services/user.service.js';
import { asyncHandler } from './asyncHandler.js';

export const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.jwtSecret);

    const user = await UserService.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export const generateToken = (userId) => {
  return jwt.sign({ userId }, ENV.jwtSecret, { expiresIn: ENV.jwtExpiresIn });
};
