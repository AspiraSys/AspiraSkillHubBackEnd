// controllers/masterDataController.js
const MasterData = require("../models/MasterData");

exports.getAllMasterData = (req, res) => {
    MasterData.getAllMasterData((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getMasterDataById = (req, res) => {
    const { id } = req.params;
    MasterData.getMasterDataById(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.filterMasterData = (req, res) => {
    const { category } = req.body;
    MasterData.filterMasterData(category, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
