import express from 'express';
import { signup, login, googleLogin, getDoctors } from '../controllers/authController.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/googlelogin", googleLogin);
router.get("/doctors", getDoctors);

export default router;