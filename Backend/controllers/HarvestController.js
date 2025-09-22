const Harvest = require('../model/HarvestModel');
const Plant = require('../model/PlantModel');

// Get all harvest records with plant details
const getAllHarvests = async (req, res) => {
    try {
        const { plantId } = req.query;
        let query = {};
        
        // Filter by plantId if provided
        if (plantId) {
            query.plantId = plantId;
        }
        
        const harvests = await Harvest.find(query).populate('plantId');
        return res.status(200).json({ harvests });
    } catch (err) {
        console.error('Get harvests error:', err);
        return res.status(500).json({ message: "Failed to fetch harvest records" });
    }
};

// Add a new harvest record
const addHarvest = async (req, res) => {
    try {
        const { plantId, actualHarvestKg, actualDate } = req.body;
        
        const harvest = new Harvest({
            plantId,
            actualHarvestKg,
            actualDate
        });

        const saved = await harvest.save();
        return res.status(201).json({ message: "Harvest record added successfully", harvest: saved });
    } catch (err) {
        console.error('Add harvest error:', err);
        const status = err.name === 'ValidationError' ? 400 : 500;
        return res.status(status).json({ message: err.message || "Failed to add harvest record" });
    }
};

// Update a harvest record
const updateHarvest = async (req, res) => {
    try {
        const { id } = req.params;
        const { actualHarvestKg, actualDate } = req.body;
        
        const harvest = await Harvest.findByIdAndUpdate(
            id,
            { actualHarvestKg, actualDate },
            { new: true, runValidators: true }
        );

        if (!harvest) {
            return res.status(404).json({ message: "Harvest record not found" });
        }

        return res.status(200).json({ message: "Harvest record updated successfully", harvest });
    } catch (err) {
        console.error('Update harvest error:', err);
        const status = err.name === 'ValidationError' ? 400 : 500;
        return res.status(status).json({ message: err.message || "Failed to update harvest record" });
    }
};

// Delete a harvest record
const deleteHarvest = async (req, res) => {
    try {
        const { id } = req.params;
        const harvest = await Harvest.findByIdAndDelete(id);
        
        if (!harvest) {
            return res.status(404).json({ message: "Harvest record not found" });
        }

        return res.status(200).json({ message: "Harvest record deleted successfully" });
    } catch (err) {
        console.error('Delete harvest error:', err);
        return res.status(500).json({ message: "Failed to delete harvest record" });
    }
};

exports.getAllHarvests = getAllHarvests;
exports.addHarvest = addHarvest;
exports.updateHarvest = updateHarvest;
exports.deleteHarvest = deleteHarvest;
