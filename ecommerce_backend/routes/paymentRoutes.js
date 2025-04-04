import express from 'express';
import { getKey, paymentVerification, processPayment } from '../controllers/paymentController.js';
const router=express.Router();

router.route("/payment/process").post(processPayment)
router.route("/getkey").get(getKey);
router.route("/paymentverification").post(paymentVerification);

export default router;