import { UserService } from '../services/user.service.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  try {
    const user = await UserService.createUser(email, password, name);

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = await UserService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user has a password (might be Google-only user)
  if (!user.password) {
    return res.status(401).json({
      success: false,
      message: 'Please use Google sign-in for this account'
    });
  }

  // Validate password
  const isValidPassword = await UserService.validatePassword(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: UserService.formatUserResponse(user),
      token
    }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.findUserById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user: UserService.formatUserResponse(user)
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, nickName, gender, country, language, timeZone, avatarUrl } = req.body;

  const updates = {};
  if (fullName !== undefined) updates.name = fullName;
  if (nickName !== undefined) updates.nickName = nickName;
  if (gender !== undefined) updates.gender = gender;
  if (country !== undefined) updates.country = country;
  if (language !== undefined) updates.language = language;
  if (timeZone !== undefined) updates.timeZone = timeZone;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  const updatedUser = await UserService.updateUser(req.user.id, updates);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password is required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Get user to check if they have a password
  const user = await UserService.findUserByEmail(req.user.email);
  
  try {
    // If user has no password (Google-only), allow setting without current password
    if (!user.password) {
      await UserService.setPassword(req.user.id, newPassword);
    } else {
      // Require current password for users with existing password
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }
      await UserService.updatePassword(req.user.id, currentPassword, newPassword);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Get user to verify
  const user = await UserService.findUserByEmail(req.user.email);

  // If user has a password, require it for deletion
  if (user.password) {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const isValidPassword = await UserService.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }
  }

  await UserService.deleteUser(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatarUrl } = req.body;

  // Validate input
  if (!googleId || !email) {
    return res.status(400).json({
      success: false,
      message: 'Google ID and email are required'
    });
  }

  try {
    const user = await UserService.findOrCreateGoogleUser({
      googleId,
      email,
      name,
      avatarUrl
    });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: UserService.formatUserResponse(user),
        token
      }
    });
  } catch (error) {
    throw error;
  }
});
