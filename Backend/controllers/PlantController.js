const Plant = require('../model/PlantModel'); // keep singular, no { get }
const GrowthModel = require('../model/GrowthModel');

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
            fertilizingFrequency
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
