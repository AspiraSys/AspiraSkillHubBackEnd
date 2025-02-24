// server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
