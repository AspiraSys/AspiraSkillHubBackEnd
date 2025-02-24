// routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");

router.get("/admin/registration/list", registrationController.getAllRegistrations);
router.get("/admin/registration/view/:id", registrationController.getRegistrationById);
router.post("/admin/registration/add", registrationController.addNewRegistration);

module.exports = router;
