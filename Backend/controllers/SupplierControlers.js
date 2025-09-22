const Supplier = require("../model/SupplierModel");

//display part
const getAllSuppliers = async (req, res, next) => {
    let suppliers;
    try {
        suppliers = await Supplier.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error retrieving suppliers" });
    }
     
    //not found
    if (!suppliers || suppliers.length === 0) {
        return res.status(404).json({ message: "Suppliers not found" });
    }
     
    // Display all suppliers
    return res.status(200).json({ suppliers });
};

//data Insert
const addSuppliers = async (req, res, next) => {
    const { name, phoneno, address, email, date, spicename, qty, price } = req.body;
    
    // Log the received data for debugging
    console.log("Received data:", { name, phoneno, address, email, date, spicename, qty, price });
    
    // Validate required fields
    if (!name || !phoneno || !address || !email || !date || !spicename || qty === undefined || qty === null || qty === '' || price === undefined || price === null || price === '') {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    // Convert and validate phoneno
    const phoneNumber = parseFloat(phoneno);
    if (isNaN(phoneNumber) || phoneNumber <= 0) {
        return res.status(400).json({ 
            message: "Phone number must be a valid positive number" 
        });
    }
    
    // Convert and validate qty
    const quantity = parseFloat(qty);
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ 
            message: "Quantity must be a valid positive number" 
        });
    }

    // Convert and validate price
    const supplierPrice = parseFloat(price);
    if (isNaN(supplierPrice) || supplierPrice <= 0) {
        return res.status(400).json({ 
            message: "Price must be a valid positive number" 
        });
    }
    
    // Validate date
    const supplierDate = new Date(date);
    if (isNaN(supplierDate.getTime())) {
        return res.status(400).json({ 
            message: "Date must be a valid date" 
        });
    }
    
    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: "Email must be in valid format" 
        });
    }
    
    let supplier;
    
    try {
        supplier = new Supplier({ 
            name: name.trim(), 
            phoneno: phoneNumber, 
            address: address.trim(), 
            email: email.trim().toLowerCase(), 
            date: supplierDate, 
            spicename: spicename.trim(), 
            qty: quantity,
            price: supplierPrice
        });
        await supplier.save();
    } catch (err) {
        console.log("Error details:", err);
        return res.status(500).json({ 
            message: "Error adding supplier", 
            error: err.message 
        });
    }
    
    return res.status(201).json({ 
        message: "Supplier added successfully",
        supplier 
    });
};

//Get by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let suppliers;
    
    try{
        suppliers = await Supplier.findById(id);
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error retrieving supplier" });
    }
    
    //not available users
    if (!suppliers){
        return res.status(404).json({message:"Supplier not found"});
    }
    return res.status(200).json({suppliers});
};

//update User Details
const updateSupplier = async (req, res, next) => {
    const id = req.params.id;
    const { name, phoneno, address, email, date, spicename, qty, price } = req.body;
    
    // Validate numeric fields if provided
    if (phoneno !== undefined) {
        const phoneNumber = parseFloat(phoneno);
        if (isNaN(phoneNumber) || phoneNumber <= 0) {
            return res.status(400).json({ 
                message: "Phone number must be a valid positive number" 
            });
        }
    }
    
    if (qty !== undefined) {
        const quantity = parseFloat(qty);
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ 
                message: "Quantity must be a valid positive number" 
            });
        }
    }

    if (price !== undefined) {
        const supplierPrice = parseFloat(price);
        if (isNaN(supplierPrice) || supplierPrice <= 0) {
            return res.status(400).json({ 
                message: "Price must be a valid positive number" 
            });
        }
    }
    
    // Validate date if provided
    if (date !== undefined) {
        const supplierDate = new Date(date);
        if (isNaN(supplierDate.getTime())) {
            return res.status(400).json({ 
                message: "Date must be a valid date" 
            });
        }
    }
    
    let suppliers;
    
    try{
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phoneno) updateData.phoneno = parseFloat(phoneno);
        if (address) updateData.address = address.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (date) updateData.date = new Date(date);
        if (spicename) updateData.spicename = spicename.trim();
        if (qty) updateData.qty = parseFloat(qty);
        if (price) updateData.price = parseFloat(price);
        
        suppliers = await Supplier.findByIdAndUpdate(id, updateData, { new: true });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Error updating supplier" });
    }
    
    if (!suppliers){
        return res.status(404).json({message:"Unable to update supplier details"});
    }
    return res.status(200).json({ suppliers});
};

//Delete User Details
const deleteSupplier = async (req, res, next) => {
    const id = req.params.id;
    let supplier;
    
    try {
        supplier = await Supplier.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error deleting supplier" });
    }
    
    if (!supplier){
        return res.status(404).json({message:"Unable to delete supplier details"});
    }
    return res.status(200).json({ message: "Supplier deleted successfully", supplier});
};

exports.getAllSuppliers = getAllSuppliers;
exports.addSuppliers = addSuppliers;
exports.getById = getById;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
