// SpiceController.js
const Spice = require("../model/SpiceModel");
const { grids } = require("../Routes/Spicegrid");

exports.createSpice = async (req, res) => {
    try {
        const spice = new Spice(req.body);
        const savedSpice = await spice.save();
        res.status(201).json(savedSpice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSpices = async (req, res) => {
    try {
        const spices = await Spice.find();
        res.json({ spices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSpiceById = async (req, res) => {
    try {
        const spice = await Spice.findById(req.params.id);
        if (!spice) return res.status(404).json({ message: "Spice not found" });
        res.json(spice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.insertSpice = async (req, res) => {
    try {
        const { type, name, currentStock, unit, quality, price, source } = req.body;
        
        // Validation to ensure all required fields are present
        if (!type || !name || !currentStock || !unit || !source) {
            return res.status(400).json({ message: "Please provide all required fields (excluding price for Plantation)" });
        }

        // Price is required only for Supplier type
        if (source === "Supplier" && !price) {
            return res.status(400).json({ message: "Please provide a price for Supplier type" });
        }
        
        const spice = new Spice({
            type,
            name,
            currentStock: Number(currentStock), // Use currentStock
            unit: unit || "kg",
            quality: quality || "High",
            price: (source === "Supplier" && price !== undefined) ? Number(price) : null, // Set price only if it's a Supplier and price is provided
            source,
        });
        
        const savedSpice = await spice.save();
        res.status(201).json(savedSpice);
    } catch (error) {
        console.error("Insert Spice Error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateSpice = async (req, res) => {
    try {
        const updatedSpice = await Spice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedSpice) return res.status(404).json({ message: "Spice not found" });
        res.json(updatedSpice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteSpice = async (req, res) => {
    try {
        const deletedSpice = await Spice.findByIdAndDelete(req.params.id);
        if (!deletedSpice) return res.status(404).json({ message: "Spice not found" });
        res.json({ message: "Spice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// New functions for filtering by source and getting chart data
exports.getSpicesBySource = async (req, res) => {
    try {
        const { source } = req.params;
        const spices = await Spice.find({ source: source });
        const modifiedSpices = spices.map(spice => ({
            ...spice.toObject(),
            type: source // Override type with source
        }));
        res.json({ spices: modifiedSpices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChartDataBySource = async (req, res) => {
    try {
        const { source } = req.params;
        const chartData = await Spice.aggregate([
            { $match: { source: source } },
            { $group: { _id: "$type", totalQuantity: { $sum: "$currentStock" } } },
            { $project: { label: "$_id", value: "$totalQuantity", _id: 0 } }
        ]);
        res.json(chartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOverallSourceDistribution = async (req, res) => {
    try {
        const { source } = req.params;

        // Calculate total quantity for the specified source
        const sourceTotal = await Spice.aggregate([
            { $match: { source: source } },
            { $group: { _id: null, total: { $sum: "$currentStock" } } }
        ]);
        const totalQuantityForSource = sourceTotal.length > 0 ? sourceTotal[0].total : 0;

        // Calculate total quantity of all spices
        const overallTotal = await Spice.aggregate([
            { $group: { _id: null, total: { $sum: "$currentStock" } } }
        ]);
        const overallTotalQuantity = overallTotal.length > 0 ? overallTotal[0].total : 0;

        res.json({
            totalQuantityForSource,
            overallTotalQuantity,
        });
    } catch (error) {
        console.error("Error fetching overall source distribution:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOverallSpiceDistributionByType = async (req, res) => {
    try {
        const overallDistribution = await Spice.aggregate([
            { $group: { _id: "$name", totalQuantity: { $sum: "$currentStock" } } },
            { $project: { label: "$_id", value: "$totalQuantity", _id: 0 } }
        ]);
        res.json(overallDistribution);
    } catch (error) {
        console.error("Error fetching overall spice distribution by type:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.getSpiceTotals = async (req, res) => {
    try {
        const totals = await Spice.aggregate([
            {
                $group: {
                    _id: "$name", // group by spice name
                    totalQuantity: { $sum: "$currentStock" },
                    unit: { $first: "$unit" }
                }
            },
            {
                $project: {
                    spice: "$_id",
                    totalQuantity: 1,
                    unit: 1,
                    _id: 0
                }
            }
        ]);
        res.json(totals);
    } catch (error) {
        console.error("Error fetching spice totals:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSpicesWithProductDetails = async (req, res) => {
    try {
        const spices = await Spice.find();

        const spicesWithDetails = spices.map(spice => {
            const gridDetail = grids.find(grid => grid.name.toLowerCase() === spice.name.toLowerCase());
            return {
                ...spice.toObject(),
                description: gridDetail ? gridDetail.description : "No description available.",
            };
        });
        res.json(spicesWithDetails);
    } catch (error) {
        console.error("Error fetching spices with product details:", error);
        res.status(500).json({ message: error.message });
    }
};
