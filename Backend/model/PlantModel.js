const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plantSchema = new Schema({
    plantId: { type: String, required: true, unique: true },
    name: { type: String, required: true, enum: ['CINNAMON', 'PEPPER', 'TURMERIC', 'CHILI', 'CARDAMOM'] },
    description: { type: String, required: true },
    plantingDivision: { type: String, required: true, enum: ['A', 'B', 'C'] },
    // Quantity planted (kg)
    plantedKg: { type: Number, default: 0 },
    // Maintenance frequencies in days
    wateringFrequency: { type: String, default: '3' },
    fertilizingFrequency: { type: String, default: '14' },
    plantingDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'HARVESTED', 'DORMANT'],
        default: 'ACTIVE'
    },
    // Growth tracking will be handled by GrowthModel
    growthStage: {
        type: String,
        enum: ['PLANTED', 'GERMINATION', 'SEEDLING', 'VEGETATIVE', 'MATURATION', 'HARVEST'],
        default: 'PLANTED'
    },
    lastUpdated: { type: Date, default: Date.now },
    notes: [{
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['WATER', 'FERTILIZE', 'PRUNE', 'TREAT', 'NOTE'] },
        details: String,
        user: String
    }]
}, { timestamps: true });

// Virtual for plant age in days
plantSchema.virtual('ageInDays').get(function() {
    return Math.floor((new Date() - this.plantingDate) / (1000 * 60 * 60 * 24));
});

// Pre-save hook to update lastUpdated
plantSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Method to add a maintenance note
plantSchema.methods.addNote = function(noteType, details, user = 'System') {
    this.notes.push({
        type: noteType,
        details,
        user
    });
    return this.save();
};

// Method to update growth stage
plantSchema.methods.updateGrowthStage = function(stage) {
    if (this.growthStage !== stage) {
        this.growthStage = stage;
        this.addNote('NOTE', `Growth stage updated to: ${stage}`);
    }
    return this.save();
};

// Static method to get plants needing maintenance
plantSchema.statics.getPlantsNeedingMaintenance = async function() {
    const GrowthModel = require('./GrowthModel');
    return await GrowthModel.getPlantsNeedingMaintenance();
};

module.exports = mongoose.model("PlantModel", plantSchema);