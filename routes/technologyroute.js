const express = require("express");
const router = express.Router();
const TechnologyController = require("../controllers/technologyControllers");

// 📌 Get all technologies
router.get("/", TechnologyController.getAllTechnologies);

// 📌 Create a new technology
router.post("/create", TechnologyController.createTechnology);

// 📌 Update an existing technology
router.put("/update/:id", TechnologyController.updateTechnology);

// 📌 Delete a technology
router.delete("/delete/:id", TechnologyController.deleteTechnology);

// 📌 Get a specific technology by ID
router.get("/stages-view/:id", TechnologyController.getTechnologyById);

module.exports = router;
