// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const db = require("./config/db");
app.use(cors());
app.use(express.json());

// Route for GET /users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});

// Import Routes
const registrationRoutes = require("./routes/registrationRoutes");
const masterDataRoutes = require("./routes/masterDataRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");


// Use Routes
app.use(registrationRoutes);
app.use(masterDataRoutes);
app.use(dashboardRoutes);
app.use(profileRoutes);

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
