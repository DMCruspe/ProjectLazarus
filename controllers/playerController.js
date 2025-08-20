// controllers/playerController.js

const User = require('../models/User');

exports.getPlayers = async (req, res) => {
    const { requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find({}, 'username role credits');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting player list' });
    }
};

exports.addCredits = async (req, res) => {
    const { username, amount } = req.body;
    try {
        const superAdminUser = await User.findOne({ username });
        if (!superAdminUser || superAdminUser.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        superAdminUser.credits += amount;
        await superAdminUser.save();
        res.status(200).json({ message: `Your balance has been updated. New balance: ${superAdminUser.credits}`, newCredits: superAdminUser.credits });
    } catch (error) {
        console.error('Error adding credits:', error);
        res.status(500).json({ message: 'An error occurred on the server' });
    }
};

exports.updatePlayerCredits = async (req, res) => {
    const { requesterUsername, targetUsername, amount } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        targetUser.credits += amount;
        await targetUser.save();
        res.status(200).json({ message: `Player ${targetUsername}'s balance has been updated.`, newCredits: targetUser.credits });
    } catch (error) {
        res.status(500).json({ message: 'Error updating balance' });
    }
};

exports.togglePlayerRole = async (req, res) => {
    const { requesterUsername, targetUsername, newRole } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || requester.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (requesterUsername === targetUsername) {
            return res.status(403).json({ message: 'You cannot change your own role' });
        }
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        targetUser.role = newRole;
        await targetUser.save();
        res.status(200).json({ message: `Player ${targetUsername}'s role has been changed to ${newRole}.`, newRole: targetUser.role });
    } catch (error) {
        res.status(500).json({ message: 'Error changing role' });
    }
};

exports.deletePlayer = async (req, res) => {
    const { requesterUsername, targetUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || requester.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (requesterUsername === targetUsername) {
            return res.status(403).json({ message: 'You cannot delete your own account' });
        }
        const result = await User.deleteOne({ username: targetUsername });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: `Account ${targetUsername} has been successfully deleted.` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting account' });
    }
};

// NEW FUNCTION: Get a list of unauthorized players
exports.getUnauthorizedPlayers = async (req, res) => {
    const { requesterUsername } = req.body;

    // Check if the user is an admin or superadmin
    try {
        const requesterUser = await User.findOne({ username: requesterUsername });
        if (!requesterUser || (requesterUser.role !== 'admin' && requesterUser.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Find all users with the role 'unauthorized'
        const unauthorizedPlayers = await User.find({ role: 'unauthorized' });

        // Send back only the usernames and request dates
        const responseData = unauthorizedPlayers.map(player => ({
            username: player.username,
            requestDate: player.requestDate
        }));

        res.json(responseData);
    } catch (error) {
        console.error('Error getting unauthorized player list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};