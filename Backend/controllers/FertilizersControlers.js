const Fertilizers = require("../model/FertilizersModel");

//display part
const getAllFertilizers = async (req, res, next) => {
    let fertilizers;
    try {
        fertilizers = await Fertilizers.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error retrieving fertilizers" });
    }
     
    //not found
    if (!fertilizers || fertilizers.length === 0) {
        return res.status(404).json({ message: "Fertilizers not found" });
    }
     
    // Display all fertilizers
    return res.status(200).json({ fertilizers });
};

//data Insert
const addFertilizers = async (req, res, next) => {
    const { fertilizerName, fType, quantity, price, date } = req.body;
    
    // Log the received data for debugging
    console.log("Received data:", { fertilizerName, fType, quantity, price, date });
    
    // Validate required fields
    if (!fertilizerName || !fType || quantity === undefined || quantity === null || quantity === '' || price === undefined || price === null || price === '' || !date) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    // Convert and validate quantity
    const fertilizeQuantity = parseFloat(quantity);
    if (isNaN(fertilizeQuantity) || fertilizeQuantity <= 0) {
        return res.status(400).json({ 
            message: "Quantity must be a valid positive number" 
        });
    }
    
    // Convert and validate price
    const fertilizePrice = parseFloat(price);
    if (isNaN(fertilizePrice) || fertilizePrice <= 0) {
        return res.status(400).json({ 
            message: "Price must be a valid positive number" 
        });
    }
    
    // Validate date
    const fertilizerDate = new Date(date);
    if (isNaN(fertilizerDate.getTime())) {
        return res.status(400).json({ 
            message: "Date must be a valid date" 
        });
    }
    
    let fertilizers;
    
    try {
        fertilizers = new Fertilizers({ 
            fertilizerName: fertilizerName.trim(), 
            fType: fType.trim(), 
            quantity: fertilizeQuantity, 
            price: fertilizePrice, 
            date: fertilizerDate
        });
        await fertilizers.save();
    } catch (err) {
        console.log("Error details:", err);
        return res.status(500).json({ 
            message: "Error adding fertilizer", 
            error: err.message 
        });
    }
    
    return res.status(201).json({ 
        message: "Fertilizer added successfully",
        fertilizers 
    });
};

//Get by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let fertilizers;
    
    try{
        fertilizers = await Fertilizers.findById(id);
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error retrieving fertilizer" });
    }
    
    //not available fertilizers
    if (!fertilizers){
        return res.status(404).json({message:"Fertilizer not found"});
    }
    return res.status(200).json({fertilizers});
};

//update Fertilizer Details
const updateFertilizers = async (req, res, next) => {
    const id = req.params.id;
    const { fertilizerName, fType, quantity, price, date } = req.body;
    
    // Validate numeric fields if provided
    if (quantity !== undefined) {
        const fertilizeQuantity = parseFloat(quantity);
        if (isNaN(fertilizeQuantity) || fertilizeQuantity <= 0) {
            return res.status(400).json({ 
                message: "Quantity must be a valid positive number" 
            });
        }
    }
    
    if (price !== undefined) {
        const fertilizePrice = parseFloat(price);
        if (isNaN(fertilizePrice) || fertilizePrice <= 0) {
            return res.status(400).json({ 
                message: "Price must be a valid positive number" 
            });
        }
    }
    
    // Validate date if provided
    if (date !== undefined) {
        const fertilizerDate = new Date(date);
        if (isNaN(fertilizerDate.getTime())) {
            return res.status(400).json({ 
                message: "Date must be a valid date" 
            });
        }
    }
    
    let fertilizers;
    
    try{
        const updateData = {};
        if (fertilizerName) updateData.fertilizerName = fertilizerName.trim();
        if (fType) updateData.fType = fType.trim();
        if (quantity) updateData.quantity = parseFloat(quantity);
        if (price) updateData.price = parseFloat(price);
        if (date) updateData.date = new Date(date);
        
        fertilizers = await Fertilizers.findByIdAndUpdate(id, updateData, { new: true });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error updating fertilizer" });
    }
    
    if (!fertilizers){
        return res.status(404).json({message:"Unable to update fertilizer details"});
    }
    return res.status(200).json({ fertilizers});
};

//Delete Fertilizer Details
const deleteFertilizers = async (req, res, next) => {
    const id = req.params.id;
    let fertilizers;
    
    try {
        fertilizers = await Fertilizers.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error deleting fertilizer" });
    }
    
    if (!fertilizers){
        return res.status(404).json({message:"Unable to delete fertilizer details"});
    }
    return res.status(200).json({ message: "Fertilizer deleted successfully", fertilizers});
};

exports.getAllFertilizers = getAllFertilizers;
exports.addFertilizers = addFertilizers;
exports.getById = getById;
exports.updateFertilizers = updateFertilizers;
exports.deleteFertilizers = deleteFertilizers;