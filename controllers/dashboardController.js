// controllers/dashboardController.js
const Dashboard = require("../models/Dashboard");

exports.getTotalAspirants = (req, res) => {
    Dashboard.getTotalAspirants((err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getTotalCourses = (req, res) => {
    Dashboard.getTotalCourses((err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getEnrolled = (req, res) => {
    Dashboard.getEnrolled((err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getJobPlacements = (req, res) => {
    Dashboard.getJobPlacements((err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getRecentProjects = (req, res) => {
    Dashboard.getRecentProjects((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getEvents = (req, res) => {
    Dashboard.getEvents((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
