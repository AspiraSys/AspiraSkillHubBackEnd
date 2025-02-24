// models/MasterData.js
const db = require("./db");

exports.getAllMasterData = (callback) => {
    db.query("SELECT * FROM master_data", callback);
};

exports.getMasterDataById = (id, callback) => {
    db.query("SELECT * FROM master_data WHERE id = ?", [id], callback);
};

