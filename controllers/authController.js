import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/config.env" });

const secretKey = process.env.secretKey;

export const signup = async (req, res) => {
    try {
        const {
            userId,
            username,
            password,
            email,
            name,
            phone,
            userType,
            location,
        } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user with all fields
        const newUser = new User({
            userId,
            username,
            password: hashedPassword,
            email,
            name,
            phone,
            userType,
            location,
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            user: {
                userId: newUser.userId,
                username: newUser.username,
                email: newUser.email,
                name: newUser.name,
                userType: newUser.userType
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.userId }, 
            process.env.JWT_SECRET,
            { expiresIn: "365d" }
        );

        return res.status(200).json({ 
            message: "Login successful",
            token,
            userId: user.userId,
            name: user.name,
            email: user.email,
            userType: user.userType,
            location: user.location
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: "Server error", error: error.message});
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { email,email_verified,sub,picture,username } = req.body;

        if(!username){
            username = email.split('@')[0];
        }
        if (!username || !email || email_verified) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newUser = new User({
            userId: uuidv4(),
            username,
            email,
            googleId:sub,
            profilePic:picture,
        });

        await newUser.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ userType: "doctor" })
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};
