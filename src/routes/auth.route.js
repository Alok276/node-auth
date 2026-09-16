import express from 'express';

import {
    register,
    login,
    refreshToken,
    logout,
    getProfile
} from '../controllers/auth.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

router.post('/refresh-token', refreshToken );
router.post('/logout', logout);

router.get('/profile', authenticateToken, getProfile);

export default router;