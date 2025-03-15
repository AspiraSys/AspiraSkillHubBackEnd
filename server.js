const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserRoutes = require('./routes/users');
const AdminRoutes=require('./routes/admin'); //login-route
const ForgotPasswordRoutes = require("./routes/forgot-password");
const timesheetRoutes = require("./routes/timesheet-details");
const trainingplanRoutes=require('./routes/trainingplan');
const eventRoutes = require("./routes/event");
const db = require("./config/db");

// Import Routes
const technologyRoutes = require("./routes/technologyroute");
const technologyStageRoutes = require("./routes/technology_stages_routes");
const certificateRoutes = require('./routes/certificateroutes');
const interviewRoutes = require("./routes/interviewroutes");

// require('dotenv').config();

const app = express();
const dotenv = require("dotenv");

dotenv.config();
// Middleware
app.use(cors());
// app.use(bodyParser.json());

// Middleware
app.use(express.json()); // Replaces bodyParser.json()

// Routes
app.use('/api/users', UserRoutes);
app.use("/api/admin", AdminRoutes);   
app.use("/api/admin", ForgotPasswordRoutes);
app.use("/api/admin", timesheetRoutes);
app.use("/api/admin",eventRoutes );
app.use("/api/admin",trainingplanRoutes );

// Define Routes
app.use("/admin/technologies", technologyRoutes);
app.use("/admin/technology_stages", technologyStageRoutes);
app.use('/admin', certificateRoutes);
app.use("/admin/interview", interviewRoutes);

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
// app.listen(port, () => {
// server.js
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const db = require("./config/db");
// app.use(cors());
// app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Hello, Node.js Server is running!");
});

// Start Server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log(`Server running on port ${PORT}`);
