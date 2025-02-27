const express = require("express");
const dotenv = require("dotenv");


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Replaces bodyParser.json()


// Import Routes
const technologyRoutes = require("./routes/technologyroute");
const technologyStageRoutes = require("./routes/technology_stages_routes");
const certificateRoutes = require('./routes/certificateroutes');
const interviewRoutes = require("./routes/interviewroutes");

// Define Routes
app.use("/admin/technologies", technologyRoutes);
app.use("/admin/technology_stages", technologyStageRoutes);
app.use('/admin', certificateRoutes);
app.use("/admin/interview", interviewRoutes);


// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
