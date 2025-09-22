const Product = require("../model/ProductModel");
const Spice = require("../model/SpiceModel");

exports.createProduct = async (req, res) => {
  try {
    const { spice_id, unit_price, description } = req.body;

    const spice = await Spice.findById(spice_id);
    if (!spice) {
      return res.status(404).json({ message: "Source spice not found" });
    }

    
    const initialQuantity = spice.quantity * 10;
    
    const newProduct = new Product({
      spice_id,
      name: spice.name,
      from: spice.name,
      type: spice.type,
      quality: spice.quality,
      sup_price: spice.sup_price,
      quantity: initialQuantity,
      unit_price: unit_price,
      description: description,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("spice_id");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("spice_id");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.sellProduct = async (req, res) => {
  try {
    const { productId, orderedQuantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < orderedQuantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.quantity -= orderedQuantity;
    await product.save();

    res.json({ message: "Product quantity updated successfully", updatedProduct: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
