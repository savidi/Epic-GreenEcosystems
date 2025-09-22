// UserRouter.js

const express = require("express");
const router = express.Router();

// Insert User Controller
const UserController = require("../controllers/UserController");

router.get("/profile", UserController.getUserProfile);
router.put("/profile", UserController.updateUserProfile);

//export
module.exports = router;