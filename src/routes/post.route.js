import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  create,
  getMine,
  getOne,
  update,
  remove
} from '../controllers/post.controller.js';
import { validateQuery } from "../middleware/validate.middleware.js";
import { postQuerySchema } from "../validators/post.validator.js"; 



const router = express.Router();

router.use(authenticateToken);

router.post('/', asyncHandler(create));

router.get('/', validateQuery(postQuerySchema), asyncHandler(getMine));

router.get('/:id', asyncHandler(getOne));

router.patch('/:id', asyncHandler(update));

router.delete('/:id', asyncHandler(remove));

export default router;

