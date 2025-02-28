const db = require("../config/db");

exports.getAllTechnologies = (req, res) => {
    db.query("SELECT * FROM technologies", (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    })};

exports.createTechnology = (req, res) => {
    const { technolgy_id, name, description, image, no_stages, languages, other_technology } = req.body;
    if (!technolgy_id || !name || !no_stages) {
      return res.status(400).json({ error: "Required fields are missing" });
    }
    const sql = "INSERT INTO technologies (technolgy_id, name, description, image, no_stages, languages, other_technology) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [technolgy_id, name, description, image, no_stages, languages, other_technology], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Technology added successfully", id: result.insertId });
      }
    })
};

exports.updateTechnology =  (req, res) => {
    const { id } = req.params;
    const { name, description, image, no_stages, languages, other_technology } = req.body;
    const sql = "UPDATE technologies SET name=?, description=?, image=?, no_stages=?, languages=?, other_technology=? WHERE id=?";
    db.query(sql, [name, description, image, no_stages, languages, other_technology, id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Technology updated successfully" });
      }
    })};

exports.deleteTechnology = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM technologies WHERE id=?", [id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Technology deleted successfully" });
      }
    });
  };

// ✅ New route: Get a single technology by ID
exports.getTechnologyById =(req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM technologies WHERE id=?", [id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(result[0] || {});
      }
    });
  };
