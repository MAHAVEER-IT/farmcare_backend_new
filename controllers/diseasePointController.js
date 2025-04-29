// controllers/diseasePointController.js
import DiseasePoint from '../models/DiseasePoint.js';
import User from '../models/User.js';

// Get all disease points (with optional filtering)
export const getAllDiseasePoints = async (req, res) => {
  try {
    const { 
      isPlantDisease, 
      startDate, 
      endDate, 
      diseaseName, 
      cropType,
      lat,
      lng,
      radius
    } = req.query;

    let query = {};
    
    // Add filters if provided
    if (isPlantDisease !== undefined) {
      query.isPlantDisease = isPlantDisease === 'true';
    }
    
    if (startDate && endDate) {
      query.reportDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    if (diseaseName) {
      query.diseaseName = { $regex: diseaseName, $options: 'i' };
    }
    
    if (cropType) {
      query.cropType = { $regex: cropType, $options: 'i' };
    }
    
    // Apply geospatial query if coordinates and radius are provided
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    const diseasePoints = await DiseasePoint.find(query)
      .sort({ reportDate: -1 })
      .populate('reportedBy', 'username name');
      
    res.status(200).json({
      success: true,
      count: diseasePoints.length,
      data: diseasePoints
    });
  } catch (error) {
    console.error('Error fetching disease points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease points',
      error: error.message
    });
  }
};

// Get a single disease point by ID
export const getDiseasePointById = async (req, res) => {
  try {
    const diseasePoint = await DiseasePoint.findById(req.params.id)
      .populate('reportedBy', 'username name');
      
    if (!diseasePoint) {
      return res.status(404).json({
        success: false,
        message: 'Disease point not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: diseasePoint
    });
  } catch (error) {
    console.error('Error fetching disease point:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease point',
      error: error.message
    });
  }
};

// Create a new disease point
export const createDiseasePoint = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      diseaseName, 
      cropType, 
      intensity, 
      caseCount,
      placeName,
      isPlantDisease,
      notes 
    } = req.body;

    // Get user from database using userId from token
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create location object in GeoJSON format
    const location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    const newDiseasePoint = new DiseasePoint({
      location,
      diseaseName,
      cropType,
      intensity: parseFloat(intensity) || caseCount / 100,
      caseCount: parseInt(caseCount),
      placeName,
      isPlantDisease: Boolean(isPlantDisease),
      notes,
      reportedBy: user._id // Use the MongoDB _id from the found user
    });

    const savedDiseasePoint = await newDiseasePoint.save();
    
    res.status(201).json({
      success: true,
      data: savedDiseasePoint
    });
  } catch (error) {
    console.error('Error creating disease point:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create disease point',
      error: error.message
    });
  }
};

// Update a disease point
export const updateDiseasePoint = async (req, res) => {
  try {
    const { 
      diseaseName, 
      cropType, 
      intensity, 
      caseCount,
      notes 
    } = req.body;
    
    const diseasePoint = await DiseasePoint.findById(req.params.id);
    
    if (!diseasePoint) {
      return res.status(404).json({
        success: false,
        message: 'Disease point not found'
      });
    }
    
    // Check if user is the one who reported this point
    if (diseasePoint.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update points you reported'
      });
    }
    
    const updatedDiseasePoint = await DiseasePoint.findByIdAndUpdate(
      req.params.id,
      {
        diseaseName: diseaseName || diseasePoint.diseaseName,
        cropType: cropType || diseasePoint.cropType,
        intensity: intensity || diseasePoint.intensity,
        caseCount: caseCount || diseasePoint.caseCount,
        notes: notes || diseasePoint.notes,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedDiseasePoint
    });
  } catch (error) {
    console.error('Error updating disease point:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update disease point',
      error: error.message
    });
  }
};

// Delete a disease point
export const deleteDiseasePoint = async (req, res) => {
  try {
    const diseasePoint = await DiseasePoint.findById(req.params.id);
    
    if (!diseasePoint) {
      return res.status(404).json({
        success: false,
        message: 'Disease point not found'
      });
    }
    
    // Check if user is the one who reported this point
    if (diseasePoint.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete points you reported'
      });
    }
    
    await DiseasePoint.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Disease point deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting disease point:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete disease point',
      error: error.message
    });
  }
};

// Get nearby disease points based on coordinates and radius
export const getNearbyDiseasePoints = async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10, isPlantDisease } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required for nearby search'
      });
    }

    console.log('Searching near:', { latitude, longitude, radiusKm, isPlantDisease }); // Debug log
    
    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radiusKm) * 1000 // Convert km to meters
        }
      }
    };
    
    // Add disease type filter if provided
    if (isPlantDisease !== undefined) {
      query.isPlantDisease = isPlantDisease === 'true';
    }

    console.log('Query:', JSON.stringify(query, null, 2)); // Debug log
    
    const diseasePoints = await DiseasePoint.find(query)
      .limit(50) // Limit results to prevent huge responses
      .populate('reportedBy', 'username name')
      .lean(); // Convert to plain JavaScript objects

    console.log('Found points:', diseasePoints.length); // Debug log
      
    res.status(200).json({
      success: true,
      count: diseasePoints.length,
      data: diseasePoints.map(point => ({
        ...point,
        location: {
          type: 'Point',
          coordinates: point.location.coordinates
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching nearby disease points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby disease points',
      error: error.message
    });
  }
};