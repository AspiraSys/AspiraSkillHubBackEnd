const db = require('../config/db');

// Fetch all users from students table
exports.getAllStudents = (req, res) => {
    // Step 1: Get all students
    const studentSql = `SELECT * FROM students`;

    db.query(studentSql, (err, students) => {
        if (err) return res.status(500).json({ error: err.message });

        if (students.length === 0) return res.json([]);

        // Step 2: Get all student_technologies using user_id
        const userIds = students.map(student => student.user_id);
        const studentTechSql = `
            SELECT st.user_id, t.name AS technology_name 
            FROM student_technologies st
            JOIN technologies t ON st.technology_id = t.id
            WHERE st.user_id IN (?);
        `;

        db.query(studentTechSql, [userIds], (err, studentTechs) => {
            if (err) return res.status(500).json({ error: err.message });

            // Step 3: Map technologies to students using user_id (Remove Duplicates)
            const studentTechMap = {};
            studentTechs.forEach(({ user_id, technology_name }) => {
                if (!studentTechMap[user_id]) {
                    studentTechMap[user_id] = new Set();
                }
                studentTechMap[user_id].add(technology_name);
            });

            // Step 4: Attach unique technology_names to each student
            const finalStudents = students.map(student => ({
                ...student,
                technology_names: studentTechMap[student.user_id] ? [...studentTechMap[student.user_id]] : []
            }));

            res.json(finalStudents);
        });
    });
};


// Create a new certificate
exports.createCertificate = (req, res) => {
    const { credential_id, user_id, technology_id, name, link, issue_date, image } = req.body;

    // SQL query to check if the user has completed all stages (1, 2, 3) for the given technology_id
    const checkCompletionQuery = `
        SELECT COUNT(DISTINCT tech_stage_id) AS completed_stages
        FROM student_technologies
        WHERE user_id = ? AND technology_id = ? AND status = '1';
    `;

    db.query(checkCompletionQuery, [user_id, technology_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0 || result[0].completed_stages < 3) {
            return res.status(400).json({ message: `User has not completed all required stages for technology ID: ${technology_id}.` });
        }

        // If completed, proceed with creating the certificate
        const insertCertificateQuery = `
            INSERT INTO student_certificates (credential_id, user_id, technology_id, name, link, issue_date, image, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
        `;

        db.query(insertCertificateQuery, [credential_id, user_id, technology_id, name, link, issue_date, image], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Certificate created successfully', id: result.insertId });
        });
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
