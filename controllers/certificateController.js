const db = require('../models/db');

// Fetch all users from students table
exports.getAllStudents = (req, res) => {
    const sql = `SELECT * FROM students`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Create a new certificate
exports.createCertificate = (req, res) => {
    const { credential_id, user_id, technology_id, name, link, issue_date, image } = req.body;
    const sql = `INSERT INTO student_certificates (credential_id, user_id, technology_id, name, link, issue_date, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    db.query(sql, [credential_id, user_id, technology_id, name, link, issue_date, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Certificate created successfully', id: result.insertId });
    });
};

// Update an existing certificate
exports.updateCertificate = (req, res) => {
    const { id } = req.params;
    const { credential_id, user_id, technology_id, name, link, issue_date, image } = req.body;
    const formattedIssueDate = issue_date ? issue_date.split('T')[0] : null;
    
    const sql = `UPDATE student_certificates 
                 SET credential_id=?, user_id=?, technology_id=?, name=?, link=?, issue_date=?, image=?, updated_at=NOW() 
                 WHERE id=?`;

    db.query(sql, [credential_id, user_id, technology_id, name, link, formattedIssueDate, image, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Certificate updated successfully' });
    });
};

// Delete a certificate
exports.deleteCertificate = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM student_certificates WHERE id = ?`;

    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Certificate deleted successfully' });
    });
};

// Fetch all certificates
exports.getAllCertificates = (req, res) => {
    const sql = `SELECT * FROM student_certificates`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Fetch certificates by user_id
exports.getCertificatesByUser = (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM student_certificates WHERE user_id = ?`;

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
