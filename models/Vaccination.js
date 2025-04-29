// models/Vaccination.js
import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  notes: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false }
});

export default vaccinationSchema;