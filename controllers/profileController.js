const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get Profile by ID
exports.getProfileById = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Profile not found" });
        res.json(result[0]); // Send user profile
    });
};

// Update Profile (Name & Email)
exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Profile not found or no changes made" });

        res.json({ message: "Profile updated successfully", result });
    });
};

// Change Password (With Hashing)
exports.changePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Profile not found or no changes made" });

            res.json({ message: "Password changed successfully", result });
        });
    } catch (error) {
        res.status(500).json({ error: "Error hashing password" });
    }
};
