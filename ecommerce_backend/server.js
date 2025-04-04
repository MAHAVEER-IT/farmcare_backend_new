import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from ecommerce backend
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

// Razorpay instance setup
export const instance = new Razorpay({
  key_id: process.env.razorpay_api_key,
  key_secret: process.env.razorpay_api_secret,
}); 