import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // Change to v4

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Debug log
console.log('JWT_SECRET status:', process.env.JWT_SECRET ? 'Configured' : 'Missing');

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if(!user){
                user = await User.create({
                    userId: uuidv4(), // Use v4 instead of v1
                    googleId: profile.id,
                    username: profile.displayName.toLowerCase().replace(/\s+/g, '_'),
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profilePic: profile.photos[0].value,
                    userType: 'user', // Default user type
                    password: uuidv4() // Generate random password for OAuth users
                });
            }

            const token = jwt.sign(
                { userId: user.userId }, 
                process.env.JWT_SECRET, // Use JWT_SECRET instead of secretKey
                { expiresIn: "24h" }
            );
            
            return done(null, {user, token});
        } catch (error) {
            console.error('Passport error:', error);
            return done(error, null);
        }
    })
);

passport.serializeUser((data, done) =>{
    done(null, data);
});

passport.deserializeUser((data, done)=>{
    done(null, data);
});