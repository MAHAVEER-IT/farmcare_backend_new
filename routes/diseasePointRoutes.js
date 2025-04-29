// routes/diseasePointRoutes.js
import express from 'express';
import { 
  getAllDiseasePoints,
  getDiseasePointById,
  createDiseasePoint,
  updateDiseasePoint,
  deleteDiseasePoint,
  getNearbyDiseasePoints
} from '../controllers/diseasePointController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all disease points with optional filtering
router.get('/', getAllDiseasePoints);

// Get nearby disease points (with geospatial query)
router.get('/nearby', getNearbyDiseasePoints);

// Get a specific disease point by ID
router.get('/:id', getDiseasePointById);

// Create a new disease point
router.post('/', createDiseasePoint);

// Update a disease point
router.put('/:id', updateDiseasePoint);

// Delete a disease point
router.delete('/:id', deleteDiseasePoint);

export default router;