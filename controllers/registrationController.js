const db = require("../config/db");

// Get All Registrations
exports.getAllRegistrations = (req, res) => {
    db.query("SELECT * FROM registrations", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get Registration by ID
exports.getRegistrationById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM registrations WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// Add New Registration
exports.addNewRegistration = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    db.query("INSERT INTO registrations (email) VALUES (?)", [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Registration added successfully", result });
    });
};
