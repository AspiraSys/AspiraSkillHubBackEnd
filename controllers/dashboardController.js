const db = require("../config/db");

// Fetch Total Aspirants
exports.getTotalAspirants = (req, res) => {
    db.query("SELECT * FROM aspirants;", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// Fetch Total Courses
exports.getTotalCourses = (req, res) => {
    db.query("SELECT * FROM technologies;", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// Fetch Total Enrolled Aspirants
exports.getEnrolled = (req, res) => {
    db.query("SELECT * FROM students;", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// Fetch Job Placements Count
exports.getJobPlacements = (req, res) => {
    db.query("SELECT * FROM students WHERE job_status = '1';", (err, result) => { 
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};



// Fetch Recent 5 Projects
exports.getRecentProjects = (req, res) => {
    db.query("SELECT * FROM student_projects ORDER BY created_at DESC LIMIT 5", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Fetch Upcoming Events
exports.getUpcomingEvents = (req, res) => {
    db.query("SELECT * FROM events WHERE date >= CURDATE() ORDER BY date ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

