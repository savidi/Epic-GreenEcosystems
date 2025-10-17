const Plant = require('../model/PlantModel'); // keep singular, no { get }
const GrowthModel = require('../model/GrowthModel');
const fs = require('fs');
const path = require('path');

// get plant
const getAllPlant = async (req, res) => {
    let plants; // lowercase variable to avoid conflict with model
    try {
        plants = await Plant.find(); // use model Plant to query
    } catch (err) {
        console.log(err);
    }

    // not found
    if (!plants) {
        return res.status(404).json({ message: "No Plants found" });
    }

    // display plants
    return res.status(200).json({ plants });
};

// data insert part
const addPlant = async (req, res, next) => {
    try {
        let { plantId, name, description, plantingDivision, plantedKg, wateringFrequency, fertilizingFrequency } = req.body;
        const lastWatered = new Date();
        // Normalize name to match enum (uppercase)
        if (typeof name === 'string') {
            name = name.toUpperCase();
        }

        // Validate enum for name
        const allowed = (Plant.schema.path('name').options.enum || []);
        if (!allowed.includes(name)) {
            return res.status(400).json({ message: `Invalid plant type. Allowed: ${allowed.join(', ')}` });
        }

        const plant = new Plant({
            plantId,
            name,
            description,
            plantingDivision,
            plantedKg,
            wateringFrequency,
            fertilizingFrequency,
        });

        const saved = await plant.save();
        return res.status(201).json({ message: "Plant added successfully", plant: saved });
    } catch (err) {
        console.error('Add plant error:', err);
        // Mongoose validation or duplicate key errors
        const status = err.name === 'ValidationError' ? 400 : 500;
        return res.status(status).json({ message: err.message || 'Unable to add plant' });
    }
}

//getbyID
const getById = async (req, res) => {
    const id = req.params.id;
    let plant;
    try {
        plant = await Plant.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!plant) {
        return res.status(404).json({ message: "No Plant found" });
    }
    return res.status(200).json({ plant });
}

//uodate plant details
const updatePlant = async (req, res) => {
    const id = req.params.id;
    const { plantId, name, description, plantingDivision, wateringFrequency, fertilizingFrequency } = req.body;

    let plant;
    try {
        plant = await Plant.findByIdAndUpdate(id, 
        {
            plantId,
            name,
            description,
            plantingDivision,
            wateringFrequency,
            fertilizingFrequency
        }, { new: true }); // return the updated document
    } catch (err) {
        console.log(err);
    }
    if (!plant) {
        return res.status(404).json({ message: "Unable To Update By this ID" });
    }
    return res.status(200).json({ plant });
}
// Mark as watered (PATCH)

const markAsWatered = async (req, res) => {
    const id = req.params.id;
    let plant;
    try {
        plant = await Plant.findByIdAndUpdate(id, { lastWatered: new Date() }, { new: true });
    } catch (err) {
        console.log(err);
    }
    if (!plant) {
        return res.status(404).json({ message: "Unable To Update By this ID" });
    }
    return res.status(200).json({ plant });
}



//delete a plant
const deletePlant = async (req, res) => {
    const id = req.params.id;
    let plant;
    try {
        plant = await Plant.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!plant) {
        return res.status(404).json({ message: "Unable To Delete By this ID" });
    }
    return res.status(200).json({ message: "Plant Successfully Deleted" });
}



exports.getAllPlant = getAllPlant;
exports.addPlant = addPlant;
exports.getById = getById;
exports.updatePlant = updatePlant;
exports.deletePlant = deletePlant;
exports.markAsWatered = markAsWatered;


// tiny helper to build cards from plants + growth
const buildPlantCards = (plants, growthDocs) => {
    const growthByPlant = new Map(growthDocs.map(g => [String(g.plantId), g]));
    const now = new Date();
    return plants.map(p => {
        const g = growthByPlant.get(String(p._id)) || {};
        // Determine simple badge
        let badge = 'Healthy';
        if (g.nextWater && new Date(g.nextWater) <= now) badge = 'Needs Watering';
        const hasPest = Array.isArray(p.notes) && p.notes.some(n => (n.type === 'TREAT' || n.type === 'NOTE') && /pest|infest/i.test(n.details || ''));
        if (hasPest) badge = 'Pest Alert';
        return {
            id: p._id,
            code: p.plantId,
            type: p.name,
            plantedDate: p.plantingDate,
            expectedHarvest: g.expectedHarvest || null,
            badge,
        };
    });
};

// Compose card data for Plant page with badges and dates
const getPlantCards = async (req, res) => {
    try {
        const { type, status } = req.query; // optional filters
        const query = type ? { name: String(type).toUpperCase() } : {};

        console.log("BLBLBLBLBLBLBL");
        // Fetch plants + growth
        const plants = await Plant.find(query).lean();
        if (!plants.length) return res.json({ cards: [] });
        const growthDocs = await GrowthModel.find({ plantId: { $in: plants.map(p => p._id) } }).lean();

        const cards = buildPlantCards(plants, growthDocs);
        const filtered = status ? cards.filter(c => c.badge.toLowerCase() === String(status).toLowerCase()) : cards;
        return res.json({ cards: filtered });
    } catch (error) {
        console.error('Error building plant cards:', error);
        return res.status(500).json({ message: 'Failed to build plant cards' });
    }
};

exports.getPlantCards = getPlantCards;

// Get available plant types from the schema enum (for filter chips)
const getPlantTypes = async (req, res) => {
    try {
        const enumVals = Plant.schema.path('name').options.enum || [];
        return res.json({ types: enumVals });
    } catch (error) {
        console.error('Error reading plant types:', error);
        return res.status(500).json({ message: 'Failed to load plant types' });
    }
};

// Summary counts for badges (Healthy, Needs Watering, Pest Alert)
const getPlantCardSummary = async (req, res) => {
    try {
        const plants = await Plant.find({}).lean();
        if (!plants.length) return res.json({ healthy: 0, needsWatering: 0, pestAlert: 0 });
        const growthDocs = await GrowthModel.find({ plantId: { $in: plants.map(p => p._id) } }).lean();
        const cards = buildPlantCards(plants, growthDocs);
        const healthy = cards.filter(c => c.badge === 'Healthy').length;
        const needsWatering = cards.filter(c => c.badge === 'Needs Watering').length;
        const pestAlert = cards.filter(c => c.badge === 'Pest Alert').length;
        return res.json({ healthy, needsWatering, pestAlert });
    } catch (error) {
        console.error('Error building summary:', error);
        return res.status(500).json({ message: 'Failed to build summary' });
    }
};

exports.getPlantTypes = getPlantTypes;
exports.getPlantCardSummary = getPlantCardSummary;

const { sendSMS } = require('../utils/sms');

const testSMS = async (req, res) => {
    try {
        const { recipient, message } = req.body;

        if (!recipient || !message) {
            return res.status(400).json({ error: 'Recipient and message are required' });
        }

        const result = await sendSMS(recipient, message);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
    }
};

exports.testSMS = testSMS;

// Controller for photo upload

// Upload photo (store only in folder)
const uploadPlantPhoto = async (req, res) => {
    try {
        const { plantId, reason } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Optional: rename file to include plantId and timestamp
        const ext = path.extname(req.file.originalname);
        const filename = `${Date.now()}-${plantId}${ext}`;
        const uploadDir = path.join(__dirname, '..', 'uploads', 'plant_photos');

        // Ensure folder exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Move file from multer temp location to target folder
        fs.renameSync(req.file.path, filePath);

        res.status(200).json({
            message: 'Photo uploaded successfully',
            filename,
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Server error while uploading photo' });
    }
};

exports.uploadPlantPhoto = uploadPlantPhoto;


// Fetch all uploaded photos for a plant
const getPlantPhotos = async (req, res) => {
    try {
        const { id } = req.params; // plant ID
        const dir = path.join(__dirname, '..', 'uploads', 'plant_photos');

        if (!fs.existsSync(dir)) {
            return res.status(200).json({ photos: [] });
        }

        // Filter files by plantId in filename
        const files = fs.readdirSync(dir);
        const plantPhotos = files.filter(file => file.includes(id));

        const photoUrls = plantPhotos.map(file =>
            `${req.protocol}://${req.get('host')}/uploads/plant_photos/${file}`
        );

        res.status(200).json({ photos: photoUrls });
    } catch (err) {
        console.error('Error fetching plant photos:', err);
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
};

exports.getPlantPhotos = getPlantPhotos;