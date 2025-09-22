const Fertilizer = require("../model/FertilizerModel");

// Create new fertilizer
const createFertilizer = async (req, res) => {
  const { fertilizerName, fType, price, quantity } = req.body;

  try {
    const newFertilizer = new Fertilizer({
      fertilizerName,
      fType,
      price,
      quantity: quantity || "0 kg"   // ✅ ensure default with kg
    });

    await newFertilizer.save();
    res.status(201).json({ message: "Fertilizer created successfully", fertilizer: newFertilizer });
  } catch (error) {
    res.status(500).json({ message: "Error creating fertilizer", error: error.message });
  }
};

// Get all fertilizers
const getFertilizers = async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find();
    res.status(200).json(fertilizers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fertilizers", error: error.message });
  }
};

// Delete fertilizer by ID
const deleteFertilizer = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFertilizer = await Fertilizer.findByIdAndDelete(id);
    if (!deletedFertilizer) {
      return res.status(404).json({ message: "Fertilizer not found" });
    }
    res.status(200).json({ message: "Fertilizer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting fertilizer", error: error.message });
  }
};

module.exports = {
  createFertilizer,
  getFertilizers,
  deleteFertilizer,
};
