const express = require("express");
const router = express.Router();  


//Insert User Controller
const SupplierControllers = require("../controllers/SupplierControlers");

// GET all suppliers
router.get("/", SupplierControllers.getAllSuppliers);

// POST new supplier
router.post("/", SupplierControllers.addSuppliers);

router.get("/:id",SupplierControllers.getById);
router.put("/:id",SupplierControllers.updateSupplier);
router.delete("/:id",SupplierControllers.deleteSupplier);

router.get("/count", async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    res.json({ totalSuppliers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suppliers count" });
  }
});

module.exports = router;