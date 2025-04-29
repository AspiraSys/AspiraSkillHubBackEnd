const express = require("express");
const router = express.Router();
const db = require("../config/db");

//Get All Technologies Assigned to an Aspirant

// router.get("/aspirant/:user_id/technologies", (req, res) => {
//     const { user_id } = req.params;

//     const query = `
//         SELECT 
//             st.technology_id, 
//             t.name AS technology, 
//             t.no_stages, 
//             COUNT(CASE WHEN st.status = '1' THEN 1 ELSE NULL END) AS completed_stages
//         FROM student_technologies st
//         JOIN technologies t ON st.technology_id = t.id
//         WHERE st.user_id = ? AND st.deleted_at IS NULL
//         GROUP BY st.technology_id, t.name, t.no_stages;
//     `;

//     db.query(query, [user_id], (err, results) => {
//         if (err) return res.status(500).json({ error: "Database error", details: err.message });

//         // Calculate completion percentage
//         const formattedResults = results.map(row => ({
//             technology_id: row.technology_id,
//             technology: row.technology,
//             no_stages: row.no_stages,
//             completion_percentage: row.no_stages > 0 
//                 ? Math.round((row.completed_stages / row.no_stages) * 100) 
//                 : 0
//         }));

//         res.json(formattedResults);
//     });
// });

router.get("/aspirant/:user_id/technologies", (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT 
            st.technology_id, 
            t.name AS technology, 
            t.no_stages, 
            COUNT(DISTINCT CASE WHEN st.status = '1' THEN st.tech_stage_id END) AS completed_stages
        FROM student_technologies st
        JOIN technologies t ON st.technology_id = t.id
        WHERE st.user_id = ? AND st.deleted_at IS NULL
        GROUP BY st.technology_id, t.name, t.no_stages;
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        const formattedResults = results.map(row => {
            const completedStages = row.completed_stages;
            const totalStages = row.no_stages;

            const completionPercentage = totalStages > 0 
                ? Math.min(Math.round((completedStages / totalStages) * 100), 100) 
                : 0;

            return {
                technology_id: row.technology_id,
                technology: row.technology,
                no_stages: totalStages,
                completed_stages: completedStages,
                completion_percentage: `${completionPercentage}%`
            };
        });

        res.json(formattedResults);
    });
});


//TO Get technology_details

router.get("/technology/:technology_id/language/:language_id/details", (req, res) => {
    const { technology_id, language_id } = req.params;

    const query = `
        SELECT 
            t.id,
            t.name AS technology_name,
            t.no_stages,
            IFNULL(material_count.total_materials, 0) AS total_materials,
            IFNULL(project_count.total_projects, 0) AS total_projects
        FROM technologies t
        LEFT JOIN (
            SELECT technology_id, language_id, COUNT(*) AS total_materials
            FROM technology_material 
            WHERE type = '1' AND language_id = ? 
            GROUP BY technology_id, language_id
        ) AS material_count ON t.id = material_count.technology_id

        LEFT JOIN (
            SELECT technology_id, language_id, COUNT(*) AS total_projects
            FROM technology_material 
            WHERE type = '2' AND language_id = ? 
            GROUP BY technology_id, language_id
        ) AS project_count ON t.id = project_count.technology_id

        WHERE t.id = ? AND t.deleted_at IS NULL;
    `;

    db.query(query, [language_id, language_id, technology_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Technology not found or no materials available" });
        }

        res.json(results[0]);
    });
});


// To ADD new technology for particular Aspirant

router.post("/aspirant/:user_id/technologies", (req, res) => {
    const { user_id } = req.params;
    const { technology_id, language_id } = req.body;

    //Fetch all materials and their tech_stage_id for the given technology and language
    const fetchMaterialsQuery = `
        SELECT id, stage_id FROM technology_material 
        WHERE technology_id = ? AND language_id = ?
    `;

    db.query(fetchMaterialsQuery, [technology_id, language_id], (err, materials) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        if (materials.length === 0) {
            return res.status(400).json({ message: "No materials found for this technology and language" });
        }

        //  Insert student_technologies entry for each material
        const insertQuery = `
            INSERT INTO student_technologies (user_id, technology_id, tech_stage_id, language_id, material_id, status, created_at, updated_at)
            VALUES ?
        `;

        const values = materials.map(material => [
            user_id, technology_id, material.stage_id, language_id, material.id, '0', new Date(), new Date()
        ]);

        db.query(insertQuery, [values], (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err.message });
            res.status(201).json({ message: "Technology assigned successfully", recordsAdded: result.affectedRows });
        });
    });
});



//To delete technology for an aspirant

router.delete("/aspirant/:user_id/technologies/:technology_id", (req, res) => {
    const { user_id, technology_id } = req.params;

    // Delete all entries for the specified technology and user
    const deleteQuery = `
        DELETE FROM student_technologies 
        WHERE user_id = ? AND technology_id = ?
    `;

    db.query(deleteQuery, [user_id, technology_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No records found for the given user and technology" });
        }

        res.status(200).json({ message: "Technology deleted successfully", deletedRecords: result.affectedRows });
    });
});



// view training plan by stages 


// router.get("/aspirant/:user_id/trainingplan/:technology_id/:stage_id", (req, res) => {
//     const { user_id, technology_id, stage_id } = req.params;

//     const query = `
//     SELECT 
//         t.id AS technology_id,
//         t.name AS technology_name,
//         ts.id AS stage_id,
//         ts.name AS stage_name,
//         tm.id AS material_id,
//         tm.name AS material_name,
//         tm.referal_link_1,
//         tm.referal_link_2,
//         tm.type AS material_type,
//         COALESCE(MAX(st.status), '0') AS status,

//         -- Total materials count for this stage
//         (SELECT COUNT(*) FROM technology_material 
//          WHERE technology_id = ? AND stage_id = ?) AS total_materials,

//         -- Completed materials count for this stage
//         (SELECT COUNT(*) FROM student_technologies 
//          WHERE user_id = ? 
//          AND technology_id = ? 
//          AND tech_stage_id = ? 
//          AND status = '1') AS completed_materials,

//         -- Project details for materials of type 2
//         sp.id AS project_id,
//         sp.title AS project_title,
//         sp.duration AS project_duration,
//         sp.project_url,
//         sp.repository_url,
//         sp.description AS project_description,
//         sp.image AS project_image

//     FROM technology_material tm
//     JOIN technologies t ON t.id = tm.technology_id
//     JOIN technology_stages ts ON ts.id = tm.stage_id
//     LEFT JOIN student_technologies st 
//         ON tm.technology_id = st.technology_id 
//         AND tm.stage_id = st.tech_stage_id 
//         AND st.user_id = ?
//     LEFT JOIN student_projects sp 
//         ON tm.type = 2 AND tm.id = sp.project_id AND sp.user_id = ?

//     WHERE tm.technology_id = ? 
//     AND tm.stage_id = ?
//     GROUP BY tm.id, t.id, t.name, ts.id, ts.name, tm.name, tm.referal_link_1, 
//              tm.referal_link_2, tm.type, sp.id, sp.title, sp.duration, sp.project_url, 
//              sp.repository_url, sp.description, sp.image;
//     `;

//     db.query(query, [
//         technology_id, stage_id, // For total_materials
//         user_id, technology_id, stage_id, // For completed_materials
//         user_id, user_id, technology_id, stage_id  // Main query params
//     ], (err, results) => {
//         if (err) {
//             console.error("Database Error:", err);
//             return res.status(500).json({ error: "Database error", details: err.message });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ error: "No materials found for this technology and stage." });
//         }

//         // Calculate completion percentage
//         const totalMaterials = results[0]?.total_materials || 0;
//         const completedMaterials = results[0]?.completed_materials || 0;
//         const completionPercentage = totalMaterials > 0 ? ((completedMaterials / totalMaterials) * 100).toFixed(2) + "%" : "0.00%";

//         //  response data
//         const response = {
//             technology_id,
//             technology_name: results[0].technology_name,
//             stage_id,
//             stage_name: results[0].stage_name,
//             user_id,
//             completion_percentage: completionPercentage,
//             materials: results.map(({ 
//                 technology_name, stage_name, total_materials, completed_materials, 
//                 project_id, project_title, project_duration, project_url, 
//                 repository_url, project_description, project_image, ...rest 
//             }) => ({
//                 ...rest,
//                 project: project_id ? {
//                     id: project_id,
//                     title: project_title,
//                     duration: project_duration,
//                     url: project_url,
//                     repository: repository_url,
//                     description: project_description,
//                     image: project_image
//                 } : null
//             }))
//         };

//         return res.status(200).json(response);
//     });
// });

router.get("/aspirant/:user_id/trainingplan/:technology_id/:stage_id", (req, res) => {
    const { user_id, technology_id, stage_id } = req.params;

    // First: get language_id from student_technologies
    const getLanguageQuery = `
        SELECT language_id 
        FROM student_technologies 
        WHERE user_id = ? AND technology_id = ? AND tech_stage_id = ? AND deleted_at IS NULL
        LIMIT 1
    `;

    db.query(getLanguageQuery, [user_id, technology_id, stage_id], (err, langResults) => {
        if (err) {
            console.error("Database Error (language fetch):", err);
            return res.status(500).json({ error: "Database error while fetching language", details: err.message });
        }

        if (!langResults.length) {
            return res.status(404).json({ error: "Language not assigned to this aspirant for this technology and stage." });
        }

        const language_id = langResults[0].language_id;

        // Now: fetch materials based on correct language_id
        const query = `
            SELECT 
                t.id AS technology_id,
                t.name AS technology_name,
                ts.id AS stage_id,
                ts.name AS stage_name,
                tm.id AS material_id,
                tm.name AS material_name,
                tm.referal_link_1,
                tm.referal_link_2,
                tm.type AS material_type,
                COALESCE(st.status, '0') AS status,

                sp.id AS project_id,
                sp.title AS project_title,
                sp.duration AS project_duration,
                sp.project_url,
                sp.repository_url,
                sp.description AS project_description,
                sp.image AS project_image,

                total_stage_materials.total_materials,
                completed_stage_materials.completed_materials

            FROM technology_material tm

            INNER JOIN technologies t ON t.id = tm.technology_id
            INNER JOIN technology_stages ts ON ts.id = tm.stage_id

            LEFT JOIN student_technologies st 
                ON st.material_id = tm.id 
                AND st.user_id = ? 
                AND st.deleted_at IS NULL

            LEFT JOIN student_projects sp 
                ON tm.type = 2 
                AND tm.id = sp.project_id 
                AND sp.user_id = ? 
                AND sp.deleted_at IS NULL

            -- Subquery for total materials
            LEFT JOIN (
                SELECT COUNT(*) AS total_materials
                FROM technology_material
                WHERE technology_id = ? 
                AND stage_id = ? 
                AND language_id = ? 
                AND deleted_at IS NULL
            ) AS total_stage_materials ON 1=1

            -- Subquery for completed materials
            LEFT JOIN (
                SELECT COUNT(*) AS completed_materials
                FROM student_technologies
                WHERE user_id = ? 
                AND technology_id = ? 
                AND tech_stage_id = ? 
                AND status = '1'
                AND deleted_at IS NULL
            ) AS completed_stage_materials ON 1=1

            WHERE tm.technology_id = ? 
            AND tm.stage_id = ?
            AND tm.language_id = ?
            AND tm.deleted_at IS NULL

            ORDER BY tm.id ASC;
        `;

        db.query(query, [
            user_id, user_id,                // For joins
            technology_id, stage_id, language_id, // For total materials
            user_id, technology_id, stage_id, // For completed materials
            technology_id, stage_id, language_id // Main WHERE
        ], (err, results) => {
            if (err) {
                console.error("Database Error (materials fetch):", err);
                return res.status(500).json({ error: "Database error while fetching materials", details: err.message });
            }

            if (!results.length) {
                return res.status(404).json({ error: "No materials found for this technology, stage, and language." });
            }

            // const totalMaterials = results[0].total_materials || 0;
            // const completedMaterials = results[0].completed_materials || 0;
            // const completionPercentage = totalMaterials > 0 
            //     ? ((completedMaterials / totalMaterials) * 100).toFixed(2) + "%" 
            //     : "0.00%";

            // const response = {
            //     technology_id: results[0].technology_id,
            //     technology_name: results[0].technology_name,
            //     stage_id: results[0].stage_id,
            //     stage_name: results[0].stage_name,
            //     user_id,
            //     completion_percentage: completionPercentage,
            //     materials: results.map(row => ({
            //         material_id: row.material_id,
            //         material_name: row.material_name,
            //         referal_link_1: row.referal_link_1,
            //         referal_link_2: row.referal_link_2,
            //         material_type: row.material_type,
            //         status: row.status,
            //         project: row.project_id ? {
            //             id: row.project_id,
            //             title: row.project_title,
            //             duration: row.project_duration,
            //             url: row.project_url,
            //             repository: row.repository_url,
            //             description: row.project_description,
            //             image: row.project_image
            //         } : null
            //     }))
            // };
            const totalMaterials = results[0].total_materials || 0;
const completedMaterials = results[0].completed_materials || 0;

let completionPercentage = 0;
if (totalMaterials > 0) {
    completionPercentage = (completedMaterials / totalMaterials) * 100;
    completionPercentage = Math.min(completionPercentage, 100); // Make sure it never exceeds 100
}
completionPercentage = completionPercentage.toFixed(2) + "%";

const response = {
    technology_id: results[0].technology_id,
    technology_name: results[0].technology_name,
    stage_id: results[0].stage_id,
    stage_name: results[0].stage_name,
    user_id,
    total_materials: totalMaterials, // <- Added this
    completed_materials: completedMaterials, // <- Added this
    completion_percentage: completionPercentage,
    materials: results.map(row => ({
        material_id: row.material_id,
        material_name: row.material_name,
        referal_link_1: row.referal_link_1,
        referal_link_2: row.referal_link_2,
        material_type: row.material_type,
        status: row.status,
        project: row.project_id ? {
            id: row.project_id,
            title: row.project_title,
            duration: row.project_duration,
            url: row.project_url,
            repository: row.repository_url,
            description: row.project_description,
            image: row.project_image
        } : null
    }))
};


            return res.status(200).json(response);
        });
    });
});

// router.get("/aspirants-progress/stages/:technology_id/:user_id", (req, res) => {
//     const { technology_id, user_id } = req.params;

//     const query = `
//         SELECT 
//             ts.id AS stage_id,
//             ts.name AS stage_name,
//             COUNT(DISTINCT tm.id) AS total_materials,
//             COUNT(DISTINCT CASE WHEN st.status = '1' THEN st.material_id ELSE NULL END) AS completed_materials
//         FROM technology_stages ts
//         LEFT JOIN technology_material tm ON ts.id = tm.stage_id AND tm.technology_id = ?
//         LEFT JOIN student_technologies st ON tm.id = st.material_id AND st.user_id = ?
//         WHERE ts.technology_id = ?
//         GROUP BY ts.id, ts.name
//         ORDER BY ts.id;
//     `;

//     db.query(query, [technology_id, user_id, technology_id], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "Database error", details: err.message });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: "No stages found for this technology." });
//         }

//         // Formatting results
//         const formattedResults = results.map(row => ({
//             stage_id: row.stage_id,
//             stage_name: row.stage_name,
//             completion_percentage: row.total_materials > 0 
//                 ? ((row.completed_materials / row.total_materials) * 100).toFixed(2) + "%"
//                 : "0.00%"
//         }));

//         res.json(formattedResults);
//     });
// });



router.get("/aspirants-progress/stages/:technology_id/:user_id", (req, res) => {
    const { technology_id, user_id } = req.params;

    const query = `
        SELECT 
            ts.id AS stage_id,
            ts.name AS stage_name,
            COUNT(DISTINCT st.material_id) AS total_materials,
            COUNT(DISTINCT CASE WHEN st.status = '1' THEN st.material_id ELSE NULL END) AS completed_materials
        FROM technology_stages ts
        LEFT JOIN technology_material tm ON ts.id = tm.stage_id AND tm.technology_id = ?
        LEFT JOIN student_technologies st ON st.material_id = tm.id AND st.user_id = ? AND st.technology_id = ?
        WHERE ts.technology_id = ?
        GROUP BY ts.id, ts.name
        ORDER BY ts.id;
    `;

    db.query(query, [technology_id, user_id, technology_id, technology_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No stages found for this technology." });
        }

        const formattedResults = results.map(row => {
            const totalMaterials = row.total_materials || 0;
            const completedMaterials = row.completed_materials || 0;

            const completionPercentage = totalMaterials > 0 
                ? Math.min((completedMaterials / totalMaterials) * 100, 100).toFixed(2) + "%"
                : "0.00%";

            return {
                stage_id: row.stage_id,
                stage_name: row.stage_name,
                total_materials: totalMaterials,
                completed_materials: completedMaterials,
                completion_percentage: completionPercentage
            };
        });

        res.json(formattedResults);
    });
});




module.exports = router;
