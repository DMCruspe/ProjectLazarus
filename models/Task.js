const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    taskType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reward: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'in_progress', 'completed'],
        default: 'active'
    },
    performer: {
        type: String,
        default: 'All'
    },
    createdBy: {
        type: String,
        required: true
    }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;