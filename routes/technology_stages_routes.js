const express = require("express");
const router = express.Router();
const TechnologyStageController = require("../controllers/technology_stages_Controllers"); // Ensure this filename matches

router.get("/", TechnologyStageController.getAllTechnologiesStages);
router.post("/create", TechnologyStageController.createTechnologyStages);
router.put("/update/:id", TechnologyStageController.updateTechnologyStages);
router.delete("/delete/:id", TechnologyStageController.deleteTechnology);
router.get("/:technology_id", TechnologyStageController.getTechnologyStagesByTechnologyId);

// Material routes
router.get("/:technology_id/beginner", TechnologyStageController.getallmaterialsBeginnerstage);
router.get("/:technology_id/intermediate", TechnologyStageController.getallmaterialsIntermediatestage);
router.get("/:technology_id/advanced", TechnologyStageController.getallmaterialsAdvancestage); // FIX: This is a duplicate function name
router.get("/:technology_id/:stage/view/:id", TechnologyStageController.getsinglematerialsstages);
router.post("/:stage/:technology_id/create", TechnologyStageController.Createsinglematerialsstages);
router.put("/:stage/:technology_id/update/:id", TechnologyStageController.updatesinglematerialsstages);
router.delete("/:technology_id/:stage/delete/:id", TechnologyStageController.DeleteSingleMaterialsStages);
router.get("/materials/viewall", TechnologyStageController.ViewallMaterials);

module.exports = router;
