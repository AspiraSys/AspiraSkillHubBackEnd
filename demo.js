const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const db = require("./config/db"); 
const app = express();
app.use(cors());
app.use(express.json());


db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Route to get training plan for a particular user
app.get('/training-plan/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      st.user_id,
      st.technology_id,
      st.tech_stage_id,
      st.material_id,
      st.status AS material_status,
      tm.name AS material_name,
      tm.type AS material_type,
      tm.description AS material_description,
      tm.referal_link_1,
      tm.referal_link_2,
      tm.duration AS material_duration,
      ts.name AS stage_name,
      t.name AS technology_name,
      sp.title AS project_title,
      sp.project_url,
      sp.repository_url,
      sp.description AS project_description,
      sp.image AS project_image,
      sp.duration AS project_duration
    FROM 
      student_technologies st
    JOIN 
      technology_material tm ON st.material_id = tm.id
    JOIN 
      technology_stages ts ON st.tech_stage_id = ts.id
    JOIN 
      technologies t ON st.technology_id = t.id
    LEFT JOIN 
      student_projects sp ON tm.id = sp.project_id AND sp.user_id = st.user_id
    WHERE 
      st.user_id = ? AND tm.type = '2';
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No training plan found for this user' });
    }

    res.json(results);
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});