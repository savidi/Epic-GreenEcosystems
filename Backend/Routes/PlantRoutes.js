const express = require("express");
const router = express.Router(); 
const multer = require('multer');
const path = require('path');


const plantController = require("../controllers/PlantController");



// --- Multer configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/plant_photos'); // folder to store images
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    },
  });


router.get("/", plantController.getAllPlant);
// Cards view for Plant page (supports optional ?type=CINNAMON&status=Healthy)
router.get("/cards", plantController.getPlantCards);

//Test
// router.post('/test-sms', plantController.testSMS);

// Types for filter chips
router.get("/types", plantController.getPlantTypes);
// Summary counts for badges
router.get("/cards/summary", plantController.getPlantCardSummary);
router.post("/", plantController.addPlant);
router.get("/:id", plantController.getById);
router.patch("/:id", plantController.markAsWatered);
router.put("/:id", plantController.updatePlant);
router.delete("/:id", plantController.deletePlant);
router.post("/sms/:id", plantController.testSMS);

// /upload-photo

router.post('/upload-photo', upload.single('photo'), plantController.uploadPlantPhoto);
router.get('/:id/photos', plantController.getPlantPhotos);



// Add more routes later (POST, PUT, DELETE, etc.)

module.exports = router;  
