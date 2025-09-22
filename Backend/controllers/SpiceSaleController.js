const Spice = require('../model/Spice');

const addSpice = async (req, res) => {
    const { name, description, price, imageUrl } = req.body;

    if (!name || !description || !price || !imageUrl) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newSpice = new Spice({
            name,
            description,
            price,
            imageUrl,
        });

        await newSpice.save();
        res.status(201).json({ message: "Spice added successfully", spice: newSpice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getAllSpices = async (req, res) => {
    try {
        const spices = await Spice.find();
        if (!spices) {
            return res.status(404).json({ message: "No spices found" });
        }
        return res.status(200).json({ spices });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getSpiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const spice = await Spice.findById(id);
        if (!spice) {
            return res.status(404).json({ message: "Spice not found" });
        }
        res.status(200).json({ spice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getAllSpices, addSpice, getSpiceById };