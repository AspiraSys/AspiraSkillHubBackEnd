const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/admin/profile/view/:id", profileController.getProfileById);
router.put("/admin/profile/edit/:id", profileController.updateProfile);
router.put("/admin/profile/change-password/:id", profileController.changePassword);

module.exports = router;  // Ensure this line is present
