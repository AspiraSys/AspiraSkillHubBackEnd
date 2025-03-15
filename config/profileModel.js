// models/Profile.js
const db = require("./db");

exports.getProfileById = (id, callback) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], callback);
};

exports.updateProfile = (id, name, email, callback) => {
    db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id], callback);
};

exports.changePassword = (id, newPassword, callback) => {
    db.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, id], callback);
};
