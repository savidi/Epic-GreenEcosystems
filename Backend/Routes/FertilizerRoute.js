const router = require("express").Router();
const { createFertilizer, getFertilizers, deleteFertilizer } = require("../controllers/FertilizerController");

// POST http://localhost:5000/fertilizers/add
router.post("/add", createFertilizer);

// GET http://localhost:5000/fertilizers
router.get("/", getFertilizers);

// DELETE http://localhost:5000/fertilizers/delete/:id
router.delete("/delete/:id", deleteFertilizer);

module.exports = router;
