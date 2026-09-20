import express from 'express';

import {
    register,
    login,
    refreshToken,
    logout,
    getProfile
} from '../controllers/auth.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validators.js';
import {asyncHandler} from '../utils/asyncHandler.js';





const router = express.Router();

// Register endpoint
router.post('/register', validate(registerSchema), asyncHandler(register));

// Login endpoint
router.post('/login', validate(loginSchema), asyncHandler(login));

router.post('/refresh-token',validate(refreshTokenSchema), asyncHandler(refreshToken)); 
router.post('/logout',validate(refreshTokenSchema), asyncHandler(logout));

router.get('/profile', authenticateToken, asyncHandler(getProfile));

export default router;

