// controllers/profileController.js
const Profile = require("../models/Profile");

exports.getProfileById = (req, res) => {
    const { id } = req.params;
    Profile.getProfileById(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    Profile.updateProfile(id, name, email, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Profile updated successfully", result });
    });
};

exports.changePassword = (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    Profile.changePassword(id, newPassword, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Password changed successfully", result });
    });
};
