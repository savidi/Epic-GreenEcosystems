const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    
    spice_id: {
      type: Schema.Types.ObjectId,
      ref: "SpiceModel",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
   
    description: {
      type: String,
    },
    
    unit: {
      type: String,
      default: "100g",
    },
    
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
   
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    
    from: {
      type: String,
      required: true,
    },
    
  },
  
);

module.exports = mongoose.model("ProductModel", productSchema);
