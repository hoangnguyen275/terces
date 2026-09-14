import express from 'express';
import { authMe } from '../controllers/userController.js';

const router = express.Router();

router.get("/me", /* protectedRouter, */authMe);

export default router;