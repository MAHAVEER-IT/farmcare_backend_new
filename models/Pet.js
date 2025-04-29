// models/Pet.js
import mongoose from 'mongoose';
import vaccinationSchema from './Vaccination.js';

const petSchema = new mongoose.Schema({
  petId: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },  // This will be the userId from your User model
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  birthDate: { type: Date, required: true },
  vetName: { type: String, default: '' },
  vetPhone: { type: String, default: '' },
  vaccinations: [vaccinationSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for searching pets by owner
petSchema.index({ ownerId: 1 });

// Middleware to update the updatedAt field before each save
petSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Pet', petSchema);