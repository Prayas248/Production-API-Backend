import express from 'express';
import { signup, signin, signout, createTable } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up',signup);

router.post('/sign-in',signin);

router.post('/sign-out',signout);

router.post('/create-table', createTable);

export default router;