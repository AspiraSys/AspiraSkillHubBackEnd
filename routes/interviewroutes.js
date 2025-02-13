const express = require("express");
const router = express.Router();
const InterviewController = require("../controllers/interviewController");

// 1. User sends an interview request
router.post("/request", InterviewController.requestInterview);

// 2. View a particular interview request
router.get("/request/:id", InterviewController.getRequestById);

// 3. Admin views pending requests
router.get("/pending", InterviewController.getPendingRequests);

// 4. Admin schedules the interview
router.post("/schedule/:id", InterviewController.scheduleInterview);

// 5. Mark interview as completed
router.put("/complete/:id", InterviewController.MarkcompleteInterview);

// 6. User/Admin cancels interview request
router.put("/cancel/:id", InterviewController.cancelInterviewStatus);

// 7. Reschedule interview
router.put("/reschedule/:id", InterviewController.rescheduleInterview);

// 8. View all interview requests
router.get("/all", InterviewController.getAllRequests);

// 9. Filter interview requests by status
router.get("/status", InterviewController.getRequestsByStatus);

// 10. Admin provides feedback and rating after interview
router.post("/feedback/:id", InterviewController.addFeedback);

module.exports = router;
