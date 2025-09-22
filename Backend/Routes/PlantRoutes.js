const express = require("express");
const router = express.Router(); 

const plantController = require("../controllers/PlantController");


router.get("/", plantController.getAllPlant);
// Cards view for Plant page (supports optional ?type=CINNAMON&status=Healthy)
router.get("/cards", plantController.getPlantCards);
// Types for filter chips
router.get("/types", plantController.getPlantTypes);
// Summary counts for badges
router.get("/cards/summary", plantController.getPlantCardSummary);
router.post("/", plantController.addPlant);
router.get("/:id", plantController.getById);
router.put("/:id", plantController.updatePlant);
router.delete("/:id", plantController.deletePlant);




// Add more routes later (POST, PUT, DELETE, etc.)

module.exports = router;  
