// models/Dashboard.js
const db = require("./db");

exports.getTotalAspirants = (callback) => {
    db.query("SELECT value FROM analytics WHERE metric_name = 'totalaspirants'", callback);
};

exports.getTotalCourses = (callback) => {
    db.query("SELECT value FROM analytics WHERE metric_name = 'totalcourses'", callback);
};

exports.getEnrolled = (callback) => {
    db.query("SELECT value FROM analytics WHERE metric_name = 'enrolled'", callback);
};

exports.getJobPlacements = (callback) => {
    db.query("SELECT value FROM analytics WHERE metric_name = 'getjob'", callback);
};

exports.getRecentProjects = (callback) => {
    db.query("SELECT * FROM projects ORDER BY created_at DESC LIMIT 5", callback);
};

exports.getEvents = (callback) => {
    db.query("SELECT * FROM events ORDER BY event_date DESC", callback);
};
