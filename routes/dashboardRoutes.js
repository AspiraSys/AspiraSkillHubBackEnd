// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/admin/dashboard/totalaspirants", dashboardController.getTotalAspirants);
router.get("/admin/dashboard/totalcourses", dashboardController.getTotalCourses);
router.get("/admin/dashboard/enrolled", dashboardController.getEnrolled);
router.get("/admin/dashboard/getjob", dashboardController.getJobPlacements);
// router.get("/admin/dashboard/requestaccess", dashboardController.getRequestAccess);
router.get("/admin/dashboard/recentproject", dashboardController.getRecentProjects);
router.get("/admin/dashboard/events", dashboardController.getUpcomingEvents);

module.exports = router;
