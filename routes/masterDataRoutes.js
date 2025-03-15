// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const masterDataController = require("../controllers/masterDataController");

router.get("/admin/masterdata/list", masterDataController.getAllMasterData);
router.get("/admin/masterdata/view/:id", masterDataController.getStudentById);
router.put("/admin/masterdata/update-jobstatus/:id", masterDataController.updateJobStatus);

module.exports = router;
