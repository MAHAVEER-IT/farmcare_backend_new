// controllers/petController.js
import Pet from '../models/Pet.js';
import { v4 as uuidv4 } from 'uuid';

// Get all pets for a user
export const getPets = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated user
    const pets = await Pet.find({ ownerId: userId });
    res.status(200).json({
      success: true,
      data: pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific pet
export const getPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const pet = await Pet.findOne({ petId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Ensure the user owns this pet
    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this pet'
      });
    }

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new pet
export const createPet = async (req, res) => {
  try {
    const { name, type, breed, birthDate, vetName, vetPhone } = req.body;
    const ownerId = req.user.userId; // Get ownerId from authenticated user

    const petId = uuidv4();

    const newPet = new Pet({
      petId,
      ownerId,
      name,
      type,
      breed,
      birthDate,
      vetName,
      vetPhone,
      vaccinations: []
    });

    const savedPet = await newPet.save();
    res.status(201).json({
      success: true,
      data: savedPet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a pet
export const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.petId;
    delete updates.ownerId;
    delete updates.vaccinations;
    delete updates.createdAt;
    delete updates.updatedAt;

    // First check if pet exists and user owns it
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    const updatedPet = await Pet.findOneAndUpdate(
      { petId },
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a pet
export const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;

    // First check if pet exists and user owns it
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pet'
      });
    }

    await Pet.findOneAndDelete({ petId });

    res.status(200).json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a vaccination to a pet
export const addVaccination = async (req, res) => {
  try {
    const { petId } = req.params;
    const { name, dueDate, notes, isRecurring } = req.body;

    // Check if pet exists and user owns it
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    const vaccination = {
      name,
      dueDate,
      notes: notes || '',
      isRecurring: isRecurring || false,
      reminderSent: false
    };

    const updatedPet = await Pet.findOneAndUpdate(
      { petId },
      { $push: { vaccinations: vaccination } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: updatedPet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a vaccination
export const updateVaccination = async (req, res) => {
  try {
    const { petId, vaccinationId } = req.params;
    const updates = req.body;

    // Check if pet exists and user owns it
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    const vaccinationIndex = pet.vaccinations.findIndex(
      v => v.id === vaccinationId
    );

    if (vaccinationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination not found'
      });
    }

    // Apply updates to the vaccination
    Object.keys(updates).forEach(key => {
      pet.vaccinations[vaccinationIndex][key] = updates[key];
    });

    await pet.save();

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a vaccination
export const deleteVaccination = async (req, res) => {
  try {
    const { petId, vaccinationId } = req.params;

    // Check if pet exists and user owns it
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    pet.vaccinations = pet.vaccinations.filter(v => v.id !== vaccinationId);
    await pet.save();

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming vaccinations
export const getUpcomingVaccinations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

    const pets = await Pet.find({ ownerId: userId });

    const upcomingVaccinations = [];

    pets.forEach(pet => {
      pet.vaccinations.forEach(vaccination => {
        const dueDate = new Date(vaccination.dueDate);
        if (dueDate >= new Date() && dueDate <= cutoffDate) {
          upcomingVaccinations.push({
            petId: pet.petId,
            petName: pet.name,
            petType: pet.type,
            vaccination: {
              id: vaccination._id,
              name: vaccination.name,
              dueDate: vaccination.dueDate,
              notes: vaccination.notes,
              isRecurring: vaccination.isRecurring,
              reminderSent: vaccination.reminderSent
            }
          });
        }
      });
    });

    // Sort by due date
    upcomingVaccinations.sort((a, b) =>
      new Date(a.vaccination.dueDate) - new Date(b.vaccination.dueDate)
    );

    res.status(200).json({
      success: true,
      data: upcomingVaccinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};