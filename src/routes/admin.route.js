import express from 'express';

import { authenticateToken } from '../middleware/auth.middleware.js';
import  { authorize }  from '../middleware/authorize.middleware.js';

import {
  getAllUsers,
  deleteUser
} from '../controllers/admin.controller.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticateToken);

router.get(
  '/users',
  authorize('admin'),
  asyncHandler(getAllUsers)
);

router.delete(
  '/users/:id',
  authorize('admin'),
  asyncHandler(deleteUser)
);

export default router;