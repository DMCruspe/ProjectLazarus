const mongoose = require('mongoose');

const UnauthorizedUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    requestDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UnauthorizedUser', UnauthorizedUserSchema);