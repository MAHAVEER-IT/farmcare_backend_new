import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true }, // Unique Admin ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ["superadmin", "moderator"], default: "moderator" }, // Role-based access
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
