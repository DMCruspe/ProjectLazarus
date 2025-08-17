const vaccineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    diseaseName: { type: String, required: true },
    dosage: { type: String, required: true },
    effectiveness: { type: Number, required: true, min: 0, max: 100 },
    sideEffects: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Vaccine = mongoose.model('Vaccine', vaccineSchema);