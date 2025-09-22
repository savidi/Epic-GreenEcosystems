const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const growthSchema = new Schema({
  plantId: { type: Schema.Types.ObjectId, ref: 'PlantModel', required: true },
  plantedDate: { type: Date, default: Date.now },
  lastWatered: { type: Date },
  lastFertilized: { type: Date },
  nextWater: { type: Date },
  nextFertilize: { type: Date },
  expectedHarvest: { type: Date }
}, { timestamps: true });

// Calculate next maintenance dates
growthSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastWatered') || this.isModified('lastFertilized')) {
    const now = new Date();
    
    // Set next water (3 days from last watered or now)
    this.nextWater = new Date(this.lastWatered || now);
    this.nextWater.setDate(this.nextWater.getDate() + 3);
    
    // Set next fertilize (14 days from last fertilized or now)
    this.nextFertilize = new Date(this.lastFertilized || now);
    this.nextFertilize.setDate(this.nextFertilize.getDate() + 14);
    
    // Set expected harvest (2 years from planting for cinnamon)
    if (!this.expectedHarvest) {
      this.expectedHarvest = new Date(this.plantedDate);
      this.expectedHarvest.setFullYear(this.expectedHarvest.getFullYear() + 2);
    }
  }
  next();
});

// Get plants needing maintenance
growthSchema.statics.getPlantsNeedingMaintenance = async function() {
  const now = new Date();
  return this.find({
    $or: [
      { nextWater: { $lte: now } },
      { nextFertilize: { $lte: now } }
    ]
  }).populate('plantId');
};

module.exports =
  mongoose.models.GrowthModel || mongoose.model("GrowthModel", growthSchema);
