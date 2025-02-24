// controllers/registrationController.js
const Registration = require("../models/Registration");

exports.getAllRegistrations = (req, res) => {
    Registration.getAllRegistrations((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getRegistrationById = (req, res) => {
    const { id } = req.params;
    Registration.getRegistrationById(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.addNewRegistration = (req, res) => {
    const { email } = req.body;
    Registration.addNewRegistration(email, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Registration added successfully", result });
    });
};
