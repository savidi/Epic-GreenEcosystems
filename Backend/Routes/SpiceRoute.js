
const express = require("express");
const router = express.Router();
const SpiceController = require("../Controllers/SpiceController");

router.get("/source/:source", SpiceController.getSpicesBySource);
router.get("/chart-data/:source", SpiceController.getChartDataBySource);
router.get("/overall-distribution/:source", SpiceController.getOverallSourceDistribution);
router.get("/overall-distribution-by-type", SpiceController.getOverallSpiceDistributionByType);
router.get("/totals", SpiceController.getSpiceTotals);
router.get("/", SpiceController.getSpices);

router.get("/with-details", SpiceController.getSpicesWithProductDetails);

router.get("/:id", SpiceController.getSpiceById);

router.post("/", SpiceController.insertSpice);
router.put("/:id", SpiceController.updateSpice);
router.delete("/:id", SpiceController.deleteSpice);

module.exports = router;