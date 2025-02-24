const express = require("express");
const router = express.Router();
const db = require("../config/db");  

//  Create a New Event
router.post("/events", (req, res) => {
    const { title, description, date, time, mode, joining_link, created_by } = req.body;
    
    const query = `
        INSERT INTO events (title, description, date, time, mode, joining_link, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [title, description, date, time, mode, joining_link, created_by];

    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.status(201).json({ message: "Event created successfully", event_id: result.insertId });
    });
});

// Get All Events (Exclude Soft-Deleted Ones)
router.get("/events", (req, res) => {
    const query = `SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date DESC`;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results);
    });
});

// Get a Single Event by ID
router.get("/events/:id", (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM events WHERE id = ? AND deleted_at IS NULL`;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(results[0]);
    });
});

//  Update an Event by ID
router.put("/events/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, mode, joining_link } = req.body;

    const query = `
        UPDATE events 
        SET title = ?, description = ?, date = ?, time = ?, mode = ?, joining_link = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
    `;

    const params = [title, description, date, time, mode, joining_link, id];

    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Event not found or already deleted" });
        }
        res.json({ message: "Event updated successfully" });
    });
});

// Delete an Event by ID
router.delete("/events/:id", (req, res) => {
    const { id } = req.params;

    const query = `UPDATE events SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Event not found or already deleted" });
        }
        res.json({ message: "Event deleted successfully" });
    });
});

module.exports = router;
