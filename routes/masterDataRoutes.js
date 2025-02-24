// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const masterDataController = require("../controllers/masterDataController");

router.get("/admin/masterdata/list", masterDataController.getAllMasterData);
router.get("/admin/masterdata/view/:id", masterDataController.getMasterDataById);

module.exports = router;
