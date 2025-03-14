const db = require("../config/db");

exports.getAllTechnologiesStages = (req, res) => {
    const sql = "SELECT * FROM technology_stages";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

exports.createTechnologyStages =  (req, res) => {
    const { technology_id, name, image, sort } = req.body; // Expecting a single object

    // Validate required fields
    if (!technology_id || !name || !sort) {
        return res.status(400).json({ error: "Required fields are missing" });
    }

    // SQL query to insert a single record
    const sql = `INSERT INTO technology_stages (technology_id, name, image, sort, deleted_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Values to insert
    const values = [
        technology_id,
        name,
        image || null,
        sort,
        null, // deleted_at is NULL by default
        new Date(), // created_at
        new Date()  // updated_at
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Technology stage added successfully", id: result.insertId });
    });
};

exports.updateTechnologyStages =  (req, res) => {
    const { id } = req.params;
    const { technology_id, name, image, sort } = req.body;

    // Ensure required fields are provided
    if (!technology_id || !name || !sort) {
        return res.status(400).json({ error: "Required fields are missing" });
    }

    const sql = "UPDATE technology_stages SET technology_id=?, name=?, image=?, sort=?, updated_at=? WHERE id=?";
    const values = [technology_id, name, image || null, sort, new Date(), id];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Technology stage updated successfully" });
    });
};

exports.deleteTechnology =  (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM technology_stages WHERE id=?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Technology stage deleted successfully" });
    });
};

// // View all materials for Beginner stage
exports.getallmaterialsBeginnerstage = (req, res) => {
    const { technology_id } = req.params;
    const sql = `SELECT * FROM technology_material WHERE technology_id = ? AND stage_id = 1`;

    db.query(sql, [technology_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};
// Get stages by technology id
exports.getTechnologyStagesByTechnologyId = (req, res) => {
    const { technology_id } = req.params;

    const sql = "SELECT * FROM technology_stages WHERE technology_id = ?";

    db.query(sql, [technology_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No stages found for this technology" });
        }

        res.json(results);
    });
};



// View all materials for Intermediate stage
exports.getallmaterialsIntermediatestage = (req, res) => {
    const { technology_id } = req.params;
    const sql = `SELECT * FROM technology_material WHERE technology_id = ? AND stage_id = 2`;

    db.query(sql, [technology_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// // View all materials for advance stage
exports.getallmaterialsAdvancestage = (req, res) => {
    const { technology_id } = req.params;
    const sql = `SELECT * FROM technology_material WHERE technology_id = ? AND stage_id = 3`;

    db.query(sql, [technology_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};


// View a Specific Material Entry by ID
exports.getsinglematerialsstages =(req, res) => {
    const { stage, technology_id, id } = req.params;

    console.log("Received Stage:", stage);
    console.log("Received Technology ID:", technology_id);
    console.log("Received Material ID:", id);

    // Map stage names to stage_id
    const stageMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const stage_id = stageMap[stage.toLowerCase().trim()];

    if (!stage_id) {
        return res.status(400).json({ error: "Invalid stage provided." });
    }

    const sql = `
        SELECT * FROM technology_material
        WHERE id = ? AND technology_id = ? AND stage_id = ?
    `;

    db.query(sql, [id, technology_id, stage_id], (err, result) => {
        if (err) {
            console.error("Error fetching material:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Material not found." });
        }

        res.json(result[0]);
    });
};

exports.Createsinglematerialsstages = (req, res) => {
    const { stage, technology_id } = req.params;
    const { language_id, name, referal_link_1, referal_link_2, image, type, description, description_2, description_3, duration } = req.body;

    console.log("Received Stage:", stage);
    console.log("Received Technology ID:", technology_id);
    console.log("Received Request Body:", req.body);

    // Normalize stage and map it to stage_id
    const stageMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const stage_id = stageMap[stage.toLowerCase().trim()];

    if (!stage_id) {
        return res.status(400).json({ error: "Invalid stage provided." });
    }

    const tech_id = parseInt(technology_id, 10);
    if (isNaN(tech_id)) {
        return res.status(400).json({ error: "Invalid technology ID" });
    }

    // Find the last order_id for this technology_id, stage_id, and language_id
    const orderQuery = `
        SELECT MAX(order_id) AS last_order FROM technology_material
        WHERE technology_id = ? AND stage_id = ? AND language_id = ?
    `;

    db.query(orderQuery, [tech_id, stage_id, language_id], (err, orderResult) => {
        if (err) {
            console.error("Error fetching last order_id:", err);
            return res.status(500).json({ error: "Database error while fetching order_id." });
        }

        // If no records exist, start from 1; otherwise, increment
        const newOrderId = (orderResult[0].last_order || 0) + 1;

        console.log(`New order_id for language ${language_id}:`, newOrderId);

        // Insert the new material with the calculated order_id
        const insertSQL = `
            INSERT INTO technology_material (technology_id, stage_id, language_id, order_id, name, referal_link_1, referal_link_2, image, type, description, description_2, description_3, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [tech_id, stage_id, language_id, newOrderId, name, referal_link_1, referal_link_2, image, type, description, description_2, description_3, duration];

        db.query(insertSQL, values, (err, result) => {
            if (err) {
                console.error("Error inserting material:", err.sqlMessage);
                return res.status(500).json({ error: "Database error while inserting data.", details: err.sqlMessage });
            }
            res.json({ message: "Material added successfully!", id: result.insertId, order_id: newOrderId });
        });
    });
};



// update Technology Material
exports.updatesinglematerialsstages = (req, res) => {
    const { stage, technology_id, id } = req.params;
    const { language_id, order_id, name, referal_link_1, referal_link_2, image, type, description, description_2, description_3, duration } = req.body;

    // Map stage names to stage_id
    const stageMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const stage_id = stageMap[stage.toLowerCase().trim()];

    if (!stage_id) {
        return res.status(400).json({ error: "Invalid stage" });
    }

    const updateSQL = `
        UPDATE technology_material 
        SET language_id=?, order_id=?, name=?, referal_link_1=?, referal_link_2=?, image=?, type=?, description=?, description_2=?, description_3=?, duration=?, updated_at=NOW() 
        WHERE id=? AND technology_id=? AND stage_id=?`;

    const values = [language_id, order_id, name, referal_link_1, referal_link_2, image, type, description, description_2, description_3, duration, id, technology_id, stage_id];

    db.query(updateSQL, values, (err, result) => {
        if (err) {
            console.error("Error updating material:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Material not found or not updated" });
        }

        res.json({ message: "Material updated successfully" });
    });
};

// Delete Technology Material
exports.DeleteSingleMaterialsStages = (req, res) => {
    const { stage, technology_id, id } = req.params;

    // Map stage names to stage_id
    const stageMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const stage_id = stageMap[stage.toLowerCase().trim()];

    if (!stage_id) {
        return res.status(400).json({ error: "Invalid stage" });
    }

    const deleteSQL = `DELETE FROM technology_material WHERE id = ? AND technology_id = ? AND stage_id = ?`;

    db.query(deleteSQL, [id, technology_id, stage_id], (err, result) => {
        if (err) {
            console.error("Error deleting material:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Material not found or already deleted" });
        }

        res.json({ message: "Material deleted successfully" });
    })
};


exports.ViewallMaterials = (req, res) => {
    const sql = "SELECT * FROM technology_material";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};