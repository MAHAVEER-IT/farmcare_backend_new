import { instance } from "../server.js";
import crypto from 'crypto';

export const processPayment=async(req,res)=>{
    const {amount} = req.body;
    const options={
        amount:Number(amount*100),
        currency:"INR",
    }
    const order =await instance.orders.create(options);
    res.status(200).json({
        success:true,
        order
    });
}

export const getKey=async(req,res)=>{
    res.status(200).json({
        key:process.env.razorpay_api_key
    })
}

export const paymentVerification =async(req,res)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;

    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSignature= crypto.createHmac('sha256',process.env.razorpay_api_secret).update(body.toString()).digest("hex");

    const isAuthentic=expectedSignature===razorpay_signature;
    if (isAuthentic) {
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentId: razorpay_payment_id,
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });
    }
    }