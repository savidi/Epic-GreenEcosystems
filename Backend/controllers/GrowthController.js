const GrowthModel = require('../model/GrowthModel');

// Record watering or fertilizing
const recordMaintenance = async (req, res) => {
    try {
        const { plantId, type } = req.body;
        let growth = await GrowthModel.findOne({ plantId });
        
        if (!growth) {
            growth = new GrowthModel({ plantId });
        }
        
        if (type === 'WATER') {
            growth.lastWatered = new Date();
        } else if (type === 'FERTILIZE') {
            growth.lastFertilized = new Date();
        }
        
        await growth.save();
        
        res.json({
            message: 'Maintenance recorded',
            data: growth
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get maintenance schedule
const getSchedule = async (req, res) => {
    try {
        const { plantId } = req.params;
        let growth = await GrowthModel.findOne({ plantId });
        
        if (!growth) {
            growth = new GrowthModel({ 
                plantId,
                plantedDate: new Date()
            });
            await growth.save();
        }
        
        res.json({
            nextWater: growth.nextWater,
            nextFertilize: growth.nextFertilize,
            expectedHarvest: growth.expectedHarvest
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get plants needing maintenance
const getNeedingMaintenance = async (req, res) => {
    try {
        const plants = await GrowthModel.getPlantsNeedingMaintenance();
        res.json(plants);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    recordMaintenance,
    getSchedule,
    getNeedingMaintenance
};
