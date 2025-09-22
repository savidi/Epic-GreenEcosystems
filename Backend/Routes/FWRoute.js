const express = require("express");
const router = express.Router();
const FWController = require("../controllers/FWControl");

router.get("/", FWController.getAllWorkers);
router.post("/", FWController.addWorkers);
router.get("/:id", FWController.getById);
router.put("/:id", FWController.updateWorker);
router.delete("/:id", FWController.deleteWorker);

module.exports = router;
