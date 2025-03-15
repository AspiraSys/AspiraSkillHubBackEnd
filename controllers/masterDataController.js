const db = require("../config/db");

// Get All Master Data
exports.getAllMasterData = (req, res) => {
    const query = `
        SELECT 
            students.*, 
            student_technologies.technology_id, 
            technologies.name AS technology_name 
        FROM students
        LEFT JOIN student_technologies ON students.user_id = student_technologies.user_id
        LEFT JOIN technologies ON student_technologies.technology_id = technologies.id;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};


// Get Master Data by ID
exports.getStudentById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM students WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// update the job status of a student
exports.updateJobStatus = (req, res) => {
    const { id } = req.params;
    let { job_status } = req.body;

    // Convert job_status to a string since ENUM stores string values
    job_status = String(job_status);

    // Ensure job_status is a valid enum value
    if (!["0", "1", "2", "3"].includes(job_status)) {
        return res.status(400).json({ error: "Invalid job_status value. Must be '0', '1', '2', or '3'." });
    }

    const query = "UPDATE students SET job_status = ? WHERE id = ?";
    const values = [job_status, id];

    console.log("Executing Query:", query, values); // Debugging line

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Query Result:", result); // Debugging line

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found or no change detected" });
        }

        res.json({ message: "Job status updated successfully", job_status });
    });
};
