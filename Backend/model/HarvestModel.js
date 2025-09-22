const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const harvestSchema = new Schema({
    plantId: { type: Schema.Types.ObjectId, ref: 'PlantModel', required: true },
    actualHarvestKg: { type: Number, required: false },
    actualDate: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("HarvestModel", harvestSchema);
