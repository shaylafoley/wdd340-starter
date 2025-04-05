// Needed Resources 
const express = require("express");
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.getVehicleDetail);
router.get("/favicon.ico", (req, res) => res.status(204).end());
//router.get("/", invController.renderManagementView);
router.get("/", invController.renderManagementView);

router.get("/add-classification", invController.renderClassificationView);
router.post("/add-classification", invController.addClassification);
router.get("/classifications", async (req, res) => {
    try {
      const classifications = await invModel.getClassifications();
      res.json(classifications);
    } catch (error) {
      res.status(500).json({ error: "Error fetching classifications" });
    }
  });
  router.get("/add-inventory", invController.renderAddInventoryView);
  router.post("/add-inventory", invController.addInventory);
  router.get("/getInventory/:classification_id", invController.getInventoryJSON)

module.exports = router;
