// models/Registration.js
const db = require("./db");

exports.getAllRegistrations = (callback) => {
    db.query("SELECT * FROM registrations", callback);
};

exports.getRegistrationById = (id, callback) => {
    db.query("SELECT * FROM registrations WHERE id = ?", [id], callback);
};

exports.addNewRegistration = (email, callback) => {
    db.query("INSERT INTO registrations (email) VALUES (?)", [email], callback);
};
