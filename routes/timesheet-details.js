const express = require("express");
const router = express.Router();
const db = require("../config/db");
// GET http://localhost:5000/api/admin/aspirants-progress 
// GET http://localhost:5000/api/admin/aspirants-progress?startDate=2024-01-01&endDate=2024-01-31
// GET http://localhost:5000/api/admin/aspirants-progress?month=1
// GET http://localhost:5000/api/admin/aspirants-progress?gender=male 


router.get("/aspirants-progress", (req, res) => {
    const { startDate, endDate, month, category, gender } = req.query;

    const query = `
        SELECT
            s.id, 
            s.user_id,
            CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS full_name,
            s.aspirant_id, 
            s.gender, 
            CASE 
                WHEN s.mode = '1' THEN 'Remote' 
                WHEN s.mode = '2' THEN 'Onsite' 
                ELSE 'Unknown' 
            END AS mode,
            t.name AS technology,
            ts.type AS last_status,
            TIMESTAMPDIFF(HOUR, ts.created_at, NOW()) AS last_updated_hours,

            -- Training Plan Status Calculation
            IFNULL(
                (
                    SELECT 
                        ROUND((COUNT(DISTINCT tm.stage_id) / COUNT(DISTINCT ts2.id)) * 100, 2)
                    FROM 
                        student_technologies st2
                    JOIN 
                        technology_material tm ON st2.technology_id = tm.technology_id
                    JOIN 
                        technology_stages ts2 ON ts2.id = tm.stage_id
                    WHERE 
                        st2.user_id = s.user_id
                        AND st2.status = '1' -- Completed stage
                        AND tm.technology_id = ts.technology_id
                ), 0
            ) AS training_plan_status

        FROM students s
        LEFT JOIN student_timesheets ts 
            ON s.user_id = ts.user_id 
        LEFT JOIN technologies t ON ts.technology_id = t.id
        WHERE ts.created_at = (
                SELECT MAX(created_at) 
                FROM student_timesheets 
                WHERE user_id = s.user_id
            )
            ${startDate && endDate ? "AND ts.date BETWEEN ? AND ?" : ""}
            ${month ? "AND MONTH(ts.date) = ?" : ""}
            ${category ? "AND ts.type = ?" : ""}
            ${gender ? "AND s.gender = ?" : ""}
        GROUP BY s.id, s.first_name, s.last_name, s.aspirant_id, s.gender, s.mode, t.name, ts.type, ts.created_at, s.user_id, ts.technology_id
        ORDER BY ts.created_at DESC
    `;

    const params = [];
    if (startDate && endDate) params.push(startDate, endDate);
    if (month) params.push(month);
    if (category) params.push(category);
    if (gender) params.push(gender);

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query error", details: err.message });
        }
        res.json(results);
    });
});



// Get all timesheets grouped by user
router.get("/timesheets", async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.user_id,
                u.name AS user_name,
                s.technology_id,
                s.type,
                s.date,
                s.start,
                s.end,
                s.hours,
                s.description,
                s.links
            FROM student_timesheets s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.user_id, s.date DESC;
        `;

        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });

            res.status(200).json({ timesheets: results });
        });

    } catch (error) {
        console.error("Error fetching timesheets:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Get filtered timesheets by user_id with additional filters (month, hours, type)
// GET http://localhost:5000/api/admin/timesheet/1?month=2024-02&hours=08&type=1
// router.get("/timesheet/:user_id", (req, res) => {
//     const userId = req.params.user_id;
//     const { month, startDate, endDate, type, hours } = req.query;

//     let query = `SELECT * FROM student_timesheets WHERE user_id = ?`;
//     let queryParams = [userId];

//     // Filter by month (format: YYYY-MM)
//     if (month) {
//         query += ` AND DATE_FORMAT(date, '%Y-%m') = ?`;
//         queryParams.push(month);
//     }

//     // Filter by date range (startDate and endDate must be in YYYY-MM-DD format)
//     if (startDate && endDate) {
//         query += ` AND date BETWEEN ? AND ?`;
//         queryParams.push(startDate, endDate);
//     }

//     // Filter by category (type)
//     if (type) {
//         query += ` AND type = ?`;
//         queryParams.push(type);
//     }

//     // Filter by hours worked
//     if (hours) {
//         query += ` AND hours = ?`;
//         queryParams.push(hours);
//     }

//     query += ` ORDER BY date DESC`; // Sorting by latest entry

//     db.query(query, queryParams, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "Database error", details: err.sqlMessage });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: "No timesheet records found with the given filters" });
//         }

//         res.status(200).json(results);
//     });
// });

router.get("/timesheet/:user_id", (req, res) => {
    const userId = req.params.user_id;
    const { month, startDate, endDate, type, hours } = req.query;

    let query = `
        SELECT 
            st.*, 
            s.aspirant_id, 
            s.first_name, 
            s.last_name
        FROM student_timesheets st
        JOIN students s ON st.user_id = s.user_id
        WHERE st.user_id = ?
    `;

    let queryParams = [userId];

    // Filter by month
    if (month) {
        query += ` AND DATE_FORMAT(st.date, '%Y-%m') = ?`;
        queryParams.push(month);
    }

    // Filter by date range
    if (startDate && endDate) {
        query += ` AND st.date BETWEEN ? AND ?`;
        queryParams.push(startDate, endDate);
    }

    // Filter by type
    if (type) {
        query += ` AND st.type = ?`;
        queryParams.push(type);
    }

    // Filter by hours
    if (hours) {
        query += ` AND st.hours = ?`;
        queryParams.push(hours);
    }

    query += ` ORDER BY st.date DESC`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.sqlMessage });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No timesheet records found with the given filters" });
        }

        res.status(200).json(results);
    });
});



// Route to get productive effort summary for a user
router.get("/timesheet/:user_id/productive-rate", (req, res) => {
    const userId = req.params.user_id;

    const query = `
        SELECT 
            type,
            COUNT(DISTINCT date) AS total_days, 
            SUM(CAST(hours AS DECIMAL(10,2))) AS total_hours
        FROM student_timesheets 
        WHERE user_id = ?
        GROUP BY type
    `;

    const totalQuery = `
        SELECT 
            COUNT(DISTINCT date) AS total_days, 
            SUM(CAST(hours AS DECIMAL(10,2))) AS total_hours
        FROM student_timesheets 
        WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.sqlMessage });
        }

        let summary = {
            productivity: { days: 0, hours: 0 },
            systemIssue: { days: 0, hours: 0 },
            leave: { days: 0, hours: 0 },
            permission: { days: 0, hours: 0 }
        };

        results.forEach(row => {
            let type = row.type;
            let totalDays = row.total_days;
            let totalHours = row.total_hours || 0;

            if (type === "1") summary.productivity = { days: totalDays, hours: totalHours };
            if (type === "2") summary.systemIssue = { days: totalDays, hours: totalHours };
            if (type === "3") summary.leave = { days: totalDays, hours: totalHours };
            if (type === "4") summary.permission = { days: totalDays, hours: totalHours };
        });

        // Fetch Total Days & Hours Separately
        db.query(totalQuery, [userId], (err, totalResult) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err.sqlMessage });
            }

            let totalDays = totalResult[0].total_days || 0;
            let totalHours = totalResult[0].total_hours || 0;

            // Calculate Productive Effort Percentage
            let productiveEffortPercentage = totalHours > 0 
                ? ((summary.productivity.days / totalDays) * 100).toFixed(2) 
                : 0;

            res.status(200).json({
                totalDays: totalDays,
                totalHours: totalHours,
                productivity: summary.productivity,
                systemIssue: summary.systemIssue,
                leave: summary.leave,
                permission: summary.permission,
                productiveEffortPercentage: productiveEffortPercentage
            });
        });
    });
});

module.exports = router;







