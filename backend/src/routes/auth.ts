import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../types';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// Mock database for MVP
const users: Map<string, any> = new Map();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    throw new AppError(400, 'Tous les champs sont requis', 'MISSING_FIELDS');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, 'Email invalide', 'INVALID_EMAIL');
  }

  if (password.length < 8) {
    throw new AppError(400, 'Le mot de passe doit contenir au moins 8 caractères', 'WEAK_PASSWORD');
  }

  // Check if user already exists
  if (users.has(email)) {
    throw new AppError(409, 'Cet email est déjà utilisé', 'EMAIL_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.set(email, user);

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  logger.info({
    action: 'USER_REGISTERED',
    userId: user.id,
    email: user.email
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    },
    message: 'Inscription réussie'
  });
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError(400, 'Email et mot de passe requis', 'MISSING_CREDENTIALS');
  }

  // Find user
  const user = users.get(email);
  if (!user) {
    throw new AppError(401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  logger.info({
    action: 'USER_LOGIN',
    userId: user.id,
    email: user.email
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    },
    message: 'Connexion réussie'
  });
}));

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Non authentifié', 'NOT_AUTHENTICATED');
  }

  const user = users.get(req.user.email);
  if (!user) {
    throw new AppError(404, 'Utilisateur non trouvé', 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt
    }
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(400, 'Token requis', 'MISSING_TOKEN');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    throw new AppError(401, 'Token invalide', 'INVALID_TOKEN');
  }
}));

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  logger.info({
    action: 'USER_LOGOUT',
    userId: req.user?.id
  });

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
}));

export default router;
