const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    taskType: { type: String, required: true },
    description: { type: String, required: true },
    reward: { type: Number, required: true, min: 0 },
    performer: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ['active', 'in_progress', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);