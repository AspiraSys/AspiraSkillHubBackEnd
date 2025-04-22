const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// DB Connection
const db = require('./config/db');


// Import Routes
const UserRoutes = require('./routes/users');
const AdminRoutes = require('./routes/admin'); // login-route
const ForgotPasswordRoutes = require('./routes/forgot-password');
const timesheetRoutes = require('./routes/timesheet-details');
const trainingplanRoutes = require('./routes/trainingplan');
const eventRoutes = require('./routes/event');

const technologyRoutes = require('./routes/technologyroute');
const technologyStageRoutes = require('./routes/technology_stages_routes');
const certificateRoutes = require('./routes/certificateroutes');
const interviewRoutes = require('./routes/interviewroutes');

const registrationRoutes = require('./routes/registrationRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Use Routes
app.use('/api/users', UserRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/admin', ForgotPasswordRoutes);
app.use('/api/admin', timesheetRoutes);
app.use('/api/admin', trainingplanRoutes);
app.use('/api/admin', eventRoutes);

app.use('/admin/technologies', technologyRoutes);
app.use('/admin/technology_stages', technologyStageRoutes);
app.use('/admin', certificateRoutes);
app.use('/admin/interview', interviewRoutes);

app.use(registrationRoutes);
app.use(masterDataRoutes);
app.use(dashboardRoutes);
app.use(profileRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
