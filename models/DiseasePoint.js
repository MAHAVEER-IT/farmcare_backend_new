// models/DiseasePoint.js
import mongoose from 'mongoose';

const diseasePointSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  diseaseName: { type: String, required: true },
  cropType: { type: String, required: true },
  intensity: { type: Number, required: true, min: 0, max: 1 },
  caseCount: { type: Number, required: true, min: 0 },
  placeName: { type: String, required: true },
  isPlantDisease: { type: Boolean, required: true },
  notes: { type: String, default: '' },
  reportDate: { type: Date, default: Date.now },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
diseasePointSchema.index({ location: '2dsphere' });

export default mongoose.model('DiseasePoint', diseasePointSchema);