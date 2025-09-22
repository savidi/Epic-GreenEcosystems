const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/ProductController");


router.post("/", ProductController.createProduct);

router.get("/", ProductController.getProducts);

router.get("/:id", ProductController.getProductById);

router.put("/:id", ProductController.updateProduct);

router.delete("/:id", ProductController.deleteProduct);

router.post("/sell", ProductController.sellProduct);

module.exports = router;
