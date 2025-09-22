const express = require("express");
const router = express.Router();

const grids = [
  {
    name: "Cinnamon",
    description: "High-quality cinnamon from our own farms. Perfect for adding a warm, sweet flavor. It's used in both sweet and savory dishes globally.",
    image: "/images/cinnamon.jpg"

  },
  {
    name: "Cardamom",
    description: "Aromatic and flavorful ground cardamom. Often called the Queen of Spices, cardamom has a strong, unique, and aromatic flavor. Ideal for both sweet and savory dishes.",
    image: "/images/cardamom.jpg"
  },
  {
    name: "Turmeric",
    description: "This bright yellow-orange spice is a staple in many cuisines. It has a slightly bitter, earthy flavor and is prized for its coloring properties and potential health benefits.",
    image: "/images/Turmeric.jpg"
  },
  {
    name: "Black Pepper",
    description: "A widely used spice from dried berries of the black pepper plant. It has a sharp, pungent flavor that adds heat and depth to almost any savory dish.",
    image: "/images/black_pepper.jpg"
  },
  {
    name: "Nutmeg",
    description: "A delicate, sweet, and nutty spice that comes from the seed of a nutmeg tree. It is commonly used in baked goods, custards, and creamy sauces.",
    image: "/images/nutmeg.jpg"
  },
  {
    name: "Cloves",
    description: "These dried flower buds have a powerful, pungent, and sweet flavor. They are used whole or ground to add a rich, warm aroma to meats, marinades, and beverages.",
    image: "/images/cloves.jpg"
  }
];

// GET /spices
router.get("/", (req, res) => {
  res.json(grids);
});

module.exports = router;

// Export the grids array separately
module.exports.grids = grids;