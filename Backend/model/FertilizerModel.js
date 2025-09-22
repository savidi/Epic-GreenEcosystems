const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fertilizerSchema = new Schema({
  fertilizerName: {
    type: String,
    required: true,
  },
  fType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,       // ✅ changed from Number → String
    required: true,
    default: "0 kg",    // ✅ now default is stored with "kg"
  }
});

const Fertilizer = mongoose.model('Fertilizer', fertilizerSchema);

module.exports = Fertilizer;
