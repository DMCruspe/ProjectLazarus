const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    symptoms: { type: String },
    spread: { type: String },
    resistance: { type: String },
    vulnerabilities: { type: String },
    treatment: { type: String },
    vaccine: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Disease = mongoose.model('Disease', diseaseSchema);