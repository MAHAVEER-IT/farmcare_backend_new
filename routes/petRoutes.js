// routes/petRoutes.js
import express from 'express';
import {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  addVaccination,
  updateVaccination,
  deleteVaccination,
  getUpcomingVaccinations
} from '../controllers/petController.js';

const router = express.Router();

// Pet routes
router.get('/', getPets);
router.get('/upcoming-vaccinations', getUpcomingVaccinations);
router.get('/:petId', getPet);
router.post('/', createPet);
router.put('/:petId', updatePet);
router.delete('/:petId', deletePet);

// Vaccination routes
router.post('/:petId/vaccinations', addVaccination);
router.put('/:petId/vaccinations/:vaccinationId', updateVaccination);
router.delete('/:petId/vaccinations/:vaccinationId', deleteVaccination);

export default router;