const symptomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subgroup: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Symptom = mongoose.model('Symptom', symptomSchema);