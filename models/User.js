import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    userType: { type: String, required: true },
    location: { type: String, default: "Coimbatore" },  // Change to default empty string instead of required
    profilePic: { type: String },
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
