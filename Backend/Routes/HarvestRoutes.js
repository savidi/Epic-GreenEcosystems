const express = require("express");
const router = express.Router(); 

const harvestController = require("../controllers/HarvestController");

router.get("/", harvestController.getAllHarvests);
router.post("/", harvestController.addHarvest);
router.put("/:id", harvestController.updateHarvest);
router.delete("/:id", harvestController.deleteHarvest);

module.exports = router;
